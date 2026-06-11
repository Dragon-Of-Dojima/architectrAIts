import 'dotenv/config';
import {db, buildings, images} from '../src/index.js';
import {listCatalogObjects} from 'architectraits-storage';
import {deriveTitle, slugify} from '../src/catalog.js';

async function seed(){
	const keys = await listCatalogObjects();
	console.log(`Found ${keys.length} objects in bucket`);

	await db.delete(buildings);
	for(const key of keys){
		const [building] = await db.insert(buildings).values({
			title: deriveTitle(key),
			slug: slugify(key)
		}).returning();
		if (!building) {
			throw new Error(`Insert returned no row for key: ${key}`);
		}
		await db.insert(images).values({buildingId: building.id, s3Key: key})
	}
	console.log(`Seeded ${keys.length} buildings`);
	process.exit(0);
}
seed().catch(function(error){
	console.log(error);
	process.exit(1);
})