import { NextResponse } from 'next/server';
import { sql, eq, isNotNull } from 'drizzle-orm';
import { db, buildings, images } from 'architectraits-db';
import { getPresignedImageUrl } from 'architectraits-storage';
import { hammingHex } from 'architectraits-shared/hamming';

export async function POST(request: Request){
	const contentType = request.headers.get('content-type') ?? '';
	if (!contentType.startsWith('image/')) {
		return NextResponse.json({ error: 'Expected an image upload' }, { status: 400 });
	}
	const bytes = await request.arrayBuffer();
	// Forward the raw image to the inference service (apps/api).
	const apiRes = await fetch(`${process.env.ANALYZE_API_URL}/analyze`, {
		method: 'POST',
		headers: { 'content-type': contentType },
		body: bytes,
	});
	if (!apiRes.ok) {
		// Surface an oversized upload as a real 413 (the inference service's
		// express.raw limit) instead of an opaque 502, so the client can show a
		// size-specific message.
		if (apiRes.status === 413) {
			return NextResponse.json({ error: 'Image too large' }, { status: 413 });
		}
		return NextResponse.json({ error: 'Analysis failed' }, { status: 502 });
	}
	const { analysis, embedding, dhash } = await apiRes.json();
	const THRESHOLD = 5;
const hashed = await db.select({ slug: buildings.slug, title: buildings.title, s3Key: images.s3Key, dhash: images.dhash }).from(images).innerJoin(buildings, eq(buildings.id, images.buildingId)).where(isNotNull(images.dhash));

const duplicates = await Promise.all(hashed.map((r) => ({ ...r, distance: hammingHex(dhash, r.dhash!) })).filter((r) => r.distance <= THRESHOLD).sort((a, b) => a.distance - b.distance).slice(0, 6).map(async (r) => ({slug: r.slug,title: r.title,distance: r.distance,url: await getPresignedImageUrl(r.s3Key),})),);
	const distance = sql<number>`${buildings.embedding} <=> ${JSON.stringify(embedding)}::vector`;
	const neighbors = await db.select({ slug: buildings.slug, title: buildings.title, s3Key: images.s3Key }).from(buildings).innerJoin(images, eq(images.buildingId, buildings.id)).where(isNotNull(buildings.embedding)).orderBy(distance).limit(6);
	const matches = await Promise.all(neighbors.map(async (n) => ({
			slug: n.slug,
			title: n.title,
			url: await getPresignedImageUrl(n.s3Key),
		})),
	);
	return NextResponse.json({ analysis, matches, duplicates });
}