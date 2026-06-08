import { eq } from 'drizzle-orm';
import { db, buildings, images } from 'architectraits-db';
import Image from 'next/image';
import Link from 'next/link';
import { getPresignedImageUrl } from 'architectraits-storage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Query: buildings leftJoin images, ordered by title.
	const rows = await db.select({
		id: buildings.id,
		title: buildings.title,
		slug: buildings.slug,
		s3Key: images.s3Key,
	}).from(buildings).innerJoin(images, eq(images.buildingId, buildings.id)).orderBy(buildings.title);

  // 2. Presign every row's s3Key in parallel.
	const cards = await Promise.all(rows.map(async (row) => ({ ...row, url: await getPresignedImageUrl(row.s3Key) })));

  // 3. Return the grid.
  return (
    <main id="wrapper" className="max-w-7xl mx-auto">
	<Link href="/analyze" className="underline">Analyze your own photo →</Link>
	 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
	   {cards.map(card => (
		    <Link key={card.id} href={`/buildings/${card.slug}`}>
			 <div className="relative aspect-[4/3]">
			   <Image src={card.url} alt={card.title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
			 </div>
			 <p>{card.title}</p>
		    </Link>
	   )) }
	 </div>
    </main>
  );
}