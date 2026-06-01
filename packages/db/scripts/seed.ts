import 'dotenv/config';
import {db, buildings, images} from '../src/index.js';
import {listCatalogObjects} from 'architectraits-storage';

function deriveTitle(key: string): string{
	let itemToReturn = key.split('/').pop() ?? key;
	itemToReturn = itemToReturn.replace(/\.[^.]+$/, '');
	itemToReturn = itemToReturn.replace(/[-_]+/g, ' ');
	itemToReturn = itemToReturn.split(' ').map((word)=> word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	return itemToReturn;
}
function slugify(key: string): string{
	let itemToReturn = key.split('/').pop() ?? key;
	itemToReturn = itemToReturn.replace(/\.[^.]+$/, '');
	itemToReturn = itemToReturn.toLowerCase();
	itemToReturn = itemToReturn.replace(/[^a-z0-9]+/g, '-');
	itemToReturn = itemToReturn.replace(/^-+|-+$/g, '');
	return itemToReturn;
}

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