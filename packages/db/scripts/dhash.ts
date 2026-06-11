import 'dotenv/config';
import { db, images, buildings } from '../src/index.js';
import { downloadCatalogObject } from 'architectraits-storage';
import { dhashImage } from 'architectraits-shared/imgcore';
import { hammingHex } from 'architectraits-shared/hamming';
import { eq, isNull } from 'drizzle-orm';

const THRESHOLD = 5;

async function dhashAll() {
  const rows = await db.select({ id: images.id, s3Key: images.s3Key, title: buildings.title }).from(images).innerJoin(buildings, eq(buildings.id, images.buildingId)).where(isNull(images.dhash));

	console.log(`Hashing ${rows.length} images`);
	const seen: { title: string; dhash: string }[] = [];

	for (const row of rows) {
		try {
			const bytes = await downloadCatalogObject(row.s3Key);
			const dhash = await dhashImage(bytes);
			await db.update(images).set({ dhash }).where(eq(images.id, row.id));

			for (const prev of seen) {
				const dist = hammingHex(dhash, prev.dhash);
				if (dist <= THRESHOLD) {
				console.log(`[dup] "${row.title}" ~ "${prev.title}" (distance ${dist})`);
				}
			}
			seen.push({ title: row.title, dhash });
			console.log(`[ok] ${row.title} -> ${dhash}`);
		} catch (e) {
			console.log(`[fail] ${row.title}:`, e);
		}
	}
	console.log('dHash complete');
	process.exit(0);
}

dhashAll().catch((e) => {
	console.log(e);
	process.exit(1);
});