// Reusable, idempotent ingest steps shared by the one-off tools scripts
// (scripts/ingest.ts, embed.ts, dhash.ts) and the long-running apps/worker.
//
// Each step keys off a nullable column in the schema, so the database itself
// is the work queue: a failed item leaves its column null and is retried on
// the next run. All steps are additive — none delete rows.

import { db } from './client';
import { buildings, images } from './schema';
import { deriveTitle, slugify } from './catalog';
import { listCatalogObjects, getPresignedImageUrl, downloadCatalogObject } from 'architectraits-storage';
import { describeBuilding, embedImage } from 'architectraits-ai';
import { dhashImage } from 'architectraits-shared/imgcore';
import { hammingHex } from 'architectraits-shared/hamming';
import { eq, and, isNull } from 'drizzle-orm';

export { deriveTitle, slugify } from './catalog';

const DUP_THRESHOLD = 5;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Find S3 objects with no images row yet and insert skeleton building+image
// rows for them (title/slug only; enrichment columns are filled by the steps
// below). Non-destructive, unlike seed which wipes and rebuilds.
export async function discoverNewObjects(): Promise<number> {
	const keys = await listCatalogObjects();
	if (keys.length === 0) {
		return 0;
	}
	const existing = await db.select({ s3Key: images.s3Key }).from(images);
	const existingKeys = new Set(existing.map((r) => r.s3Key));
	const newKeys = keys.filter((key) => !existingKeys.has(key));

	let inserted = 0;
	for (const key of newKeys) {
		try {
			const [building] = await db
				.insert(buildings)
				.values({ title: deriveTitle(key), slug: slugify(key) })
				.returning();
			if (!building) {
				throw new Error(`Insert returned no row for key: ${key}`);
			}
			await db.insert(images).values({ buildingId: building.id, s3Key: key });
			inserted++;
			console.log(`[new] ${key} -> ${building.slug}`);
		} catch (e) {
			console.log(`[new fail] ${key}:`, e);
		}
	}
	return inserted;
}

// Vision metadata for buildings that haven't been AI-processed and aren't
// human-edited. Sequential with a 1s gap to stay friendly to OpenRouter.
export async function runDescriptions(): Promise<void> {
	const model = process.env.OPENROUTER_VISION_MODEL;
	if (!model) {
		throw new Error('OPENROUTER_VISION_MODEL is not set');
	}
	const rows = await db
		.select({ id: buildings.id, title: buildings.title, s3Key: images.s3Key })
		.from(buildings)
		.innerJoin(images, eq(images.buildingId, buildings.id))
		.where(and(isNull(buildings.ai_processed_at), eq(buildings.editedByHuman, false)));

	for (const row of rows) {
		try {
			const url = await getPresignedImageUrl(row.s3Key);
			const result = await describeBuilding(url);
			await db
				.update(buildings)
				.set({
					description: result.description,
					primary_style: result.primaryStyle,
					era: result.era,
					yearBuiltEstimate: result.yearBuiltEstimate,
					ai_model: model,
					ai_processed_at: new Date(),
				})
				.where(eq(buildings.id, row.id));
			console.log(`[desc ok] ${row.title} -> ${result.primaryStyle}`);
		} catch (e) {
			console.log(`[desc fail] ${row.title}:`, e);
		}
		await sleep(1000);
	}
}

// SigLIP embeddings for buildings missing one.
export async function runEmbeddings(): Promise<void> {
	const rows = await db
		.select({ id: buildings.id, title: buildings.title, s3Key: images.s3Key })
		.from(buildings)
		.innerJoin(images, eq(images.buildingId, buildings.id))
		.where(isNull(buildings.embedding));

	for (const row of rows) {
		try {
			const url = await getPresignedImageUrl(row.s3Key);
			const vec = await embedImage(url);
			await db.update(buildings).set({ embedding: vec }).where(eq(buildings.id, row.id));
			console.log(`[embed ok] ${row.title}`);
		} catch (e) {
			console.log(`[embed fail] ${row.title}:`, e);
		}
	}
}

// Perceptual dHashes for images missing one; logs near-duplicate pairs found
// within this run (Hamming distance <= threshold).
export async function runDhashes(): Promise<void> {
	const rows = await db
		.select({ id: images.id, s3Key: images.s3Key, title: buildings.title })
		.from(images)
		.innerJoin(buildings, eq(buildings.id, images.buildingId))
		.where(isNull(images.dhash));

	const seen: { title: string; dhash: string }[] = [];
	for (const row of rows) {
		try {
			const bytes = await downloadCatalogObject(row.s3Key);
			const dhash = await dhashImage(bytes);
			await db.update(images).set({ dhash }).where(eq(images.id, row.id));
			for (const prev of seen) {
				const dist = hammingHex(dhash, prev.dhash);
				if (dist <= DUP_THRESHOLD) {
					console.log(`[dup] "${row.title}" ~ "${prev.title}" (distance ${dist})`);
				}
			}
			seen.push({ title: row.title, dhash });
			console.log(`[dhash ok] ${row.title} -> ${dhash}`);
		} catch (e) {
			console.log(`[dhash fail] ${row.title}:`, e);
		}
	}
}
