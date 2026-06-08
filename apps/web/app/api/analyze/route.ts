import { NextResponse } from 'next/server';
import { sql, eq, isNotNull } from 'drizzle-orm';
import { db, buildings, images } from 'architectraits-db';
import { getPresignedImageUrl } from 'architectraits-storage';

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
		return NextResponse.json({ error: 'Analysis failed' }, { status: 502 });
	}
	const { analysis, embedding } = await apiRes.json();
	const distance = sql<number>`${buildings.embedding} <=> ${JSON.stringify(embedding)}::vector`;
	const neighbors = await db
		.select({ slug: buildings.slug, title: buildings.title, s3Key: images.s3Key })
		.from(buildings)
		.innerJoin(images, eq(images.buildingId, buildings.id))
		.where(isNotNull(buildings.embedding))
		.orderBy(distance)
		.limit(6);
	const matches = await Promise.all(
		neighbors.map(async (n) => ({
			slug: n.slug,
			title: n.title,
			url: await getPresignedImageUrl(n.s3Key),
		})),
	);
	return NextResponse.json({ analysis, matches });
}