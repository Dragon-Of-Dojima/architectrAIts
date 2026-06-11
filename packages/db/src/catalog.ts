// Pure helpers for turning an S3 object key into catalog metadata.
// Kept dependency-free so seed (and the discovery job) can share them
// without pulling in the heavy ai/storage modules.

export function deriveTitle(key: string): string {
	let itemToReturn = key.split('/').pop() ?? key;
	itemToReturn = itemToReturn.replace(/\.[^.]+$/, '');
	itemToReturn = itemToReturn.replace(/[-_]+/g, ' ');
	itemToReturn = itemToReturn.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
	return itemToReturn;
}

export function slugify(key: string): string {
	let itemToReturn = key.split('/').pop() ?? key;
	itemToReturn = itemToReturn.replace(/\.[^.]+$/, '');
	itemToReturn = itemToReturn.toLowerCase();
	itemToReturn = itemToReturn.replace(/[^a-z0-9]+/g, '-');
	itemToReturn = itemToReturn.replace(/^-+|-+$/g, '');
	return itemToReturn;
}
