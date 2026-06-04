import 'dotenv/config';
import { db, buildings, images } from '../src/index.js';
import { getPresignedImageUrl } from 'architectraits-storage';
import { describeBuilding } from 'architectraits-ai';
import { eq, and, isNull } from 'drizzle-orm';


async function ingest(){
	const model = process.env.OPENROUTER_VISION_MODEL;
	if (!model) {
		throw new Error('OPENROUTER_VISION_MODEL is not set');
	}
	const rows = await db.select({ id: buildings.id, title: buildings.title, s3Key: images.s3Key }).from(buildings).innerJoin(images, eq(images.buildingId, buildings.id)).where(and(isNull(buildings.ai_processed_at), eq(buildings.editedByHuman, false)))
	for(const row of rows){
		try{
			const url = await getPresignedImageUrl(row.s3Key);
			const result = await describeBuilding(url);
			await db.update(buildings).set({ description: result.description, primary_style: result.primaryStyle, era: result.era, yearBuiltEstimate: result.yearBuiltEstimate, ai_model: model, ai_processed_at: new Date() }).where(eq(buildings.id, row.id));
			console.log(`[ok] ${row.title} -> ${result.primaryStyle}`)
		}catch(e){
			console.log(`[fail] ${row.title}:`, e);
		}
		await new Promise((r) => setTimeout(r, 1000));
	}
	console.log('Ingest complete');
	process.exit(0);
}

ingest().catch((e) => {
	console.log(e);
	process.exit(1);
	});