import { eq, and, ne, isNotNull, cosineDistance, sql } from 'drizzle-orm';
import { db, buildings, images } from 'architectraits-db';
import { getPresignedImageUrl } from 'architectraits-storage';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ slug: string }>;   // <-- params is a Promise in Next 16
}) {
  const { slug } = await params;        // <-- must await it
  // 1. Query ONE building by slug. Pull the detail fields too
  //    (title, era, primary_style, yearBuiltEstimate, sourceUrl, license, s3Key).
  //    .where(eq(buildings.slug, slug)).limit(1)
	const rows = await db.select({
		id: buildings.id,
		title: buildings.title,
		era: buildings.era,
		primaryStyle: buildings.primary_style,
		description: buildings.description,
		yearBuiltEstimate: buildings.yearBuiltEstimate,
		sourceUrl: buildings.sourceUrl,
		license: buildings.license,
		embedding: buildings.embedding,
		s3Key: images.s3Key,
	}).from(buildings).innerJoin(images, eq(images.buildingId, buildings.id)).where(eq(buildings.slug, slug)).limit(1);
	const building = rows[0];
  // 2. If no row -> notFound();  (renders a 404)
	if(!building){
		notFound();
	}
  // 3. Presign the row's s3Key (single await, no Promise.all needed here).
  //const cards = await Promise.all(rows.map(async (row) => ({ ...row, url: await getPresignedImageUrl(row.s3Key) })));
	const page = await getPresignedImageUrl(building.s3Key)
	let related: { slug: string; title: string; url: string }[] = [];
	if (building.embedding) {
		const distance = sql<number>`${cosineDistance(buildings.embedding, building.embedding)}`;
		const neighbors = await db
			.select({ slug: buildings.slug, title: buildings.title, s3Key: images.s3Key })
			.from(buildings)
			.innerJoin(images, eq(images.buildingId, buildings.id))
			.where(and(ne(buildings.id, building.id), isNotNull(buildings.embedding)))
			.orderBy(distance)
			.limit(6);
		related = await Promise.all(
			neighbors.map(async (n) => ({ slug: n.slug, title: n.title, url: await getPresignedImageUrl(n.s3Key) })),
		);
	}
  // 4. Return the detail layout: big image + metadata.
  return (
	<main className="max-w-4xl mx-auto p-6">
		<div className="relative aspect-[3/2]">
		<Image src={page} alt={building.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
		</div>
		<h1 className="mt-4 text-2xl font-semibold">{building.title}</h1>
		{/* conditionally render metadata that exists: */}
		{building.era && <p>Era: {building.era}</p>}
		{building.primaryStyle && <p>Style: {building.primaryStyle}</p>}
		{building.description && <p className="mt-4 leading-relaxed">{building.description}</p>}
		{building.yearBuiltEstimate && <p>Built ~{building.yearBuiltEstimate}</p>}
		{related.length > 0 && (
			<section className="mt-10">
				<h2 className="text-xl font-semibold mb-4">Related buildings</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{related.map((r) => (
						<Link key={r.slug} href={`/buildings/${r.slug}`} className="block group">
							<div className="relative aspect-[3/2] overflow-hidden rounded">
								<Image src={r.url} alt={r.title} fill sizes="(max-width: 768px) 50vw, 33vw"
									className="object-cover transition-transform group-hover:scale-105" />
							</div>
							<p className="mt-2 text-sm">{r.title}</p>
						</Link>
					))}
				</div>
			</section>
		)}
		{/* sourceUrl as a link, license as text, etc. */}
	</main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const [row] = await db.select({ title: buildings.title })
	  .from(buildings).where(eq(buildings.slug, slug)).limit(1);
	return { title: row?.title ?? 'Building' };
}