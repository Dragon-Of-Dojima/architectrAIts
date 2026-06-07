import 'dotenv/config';
import { db, buildings, images } from '../src/index.js';
import { getPresignedImageUrl } from 'architectraits-storage';
import { embedImage } from 'architectraits-ai';
import { eq, isNull } from 'drizzle-orm';

async function embed() {
	const rows = await db
		.select({ id: buildings.id, title: buildings.title, s3Key: images.s3Key })
		.from(buildings)
		.innerJoin(images, eq(images.buildingId, buildings.id))
		.where(isNull(buildings.embedding));

	console.log(`Embedding ${rows.length} buildings`);
	for (const row of rows) {
		try {
			const url = await getPresignedImageUrl(row.s3Key);
			const vec = await embedImage(url);
			await db.update(buildings).set({ embedding: vec }).where(eq(buildings.id, row.id));
			console.log(`[ok] ${row.title}`);
		} catch (e) {
			console.log(`[fail] ${row.title}:`, e);
		}
	}
	console.log('Embed complete');
	process.exit(0);
}

embed().catch((e) => {
	console.log(e);
	process.exit(1);
});