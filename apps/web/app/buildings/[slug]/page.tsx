import { eq } from 'drizzle-orm';
import { db, buildings, images } from 'architectraits-db';
import { getPresignedImageUrl } from 'architectraits-storage';
import { notFound } from 'next/navigation';
import Image from 'next/image';

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
		title: buildings.title,
		era: buildings.era,
		primaryStyle: buildings.primary_style,
		yearBuiltEstimate: buildings.yearBuiltEstimate,
		sourceUrl: buildings.sourceUrl,
		license: buildings.license,
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
		{building.yearBuiltEstimate && <p>Built ~{building.yearBuiltEstimate}</p>}
		{/* sourceUrl as a link, license as text, etc. */}
	</main>
  );
}