import { eq } from 'drizzle-orm';
import { db, buildings, images } from 'architectraits-db';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPresignedImageUrl } from 'architectraits-storage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Catalog' };

export default async function CatalogPage() {
	const rows = await db
		.select({
			id: buildings.id,
			title: buildings.title,
			slug: buildings.slug,
			s3Key: images.s3Key,
		})
		.from(buildings)
		.innerJoin(images, eq(images.buildingId, buildings.id))
		.orderBy(buildings.title);

	const cards = await Promise.all(
		rows.map(async (row) => ({ ...row, url: await getPresignedImageUrl(row.s3Key) })),
	);

	return (
		<main className="mx-auto max-w-7xl p-6">
			<header className="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
				<Link href="/" className="text-sm underline">
					← Home
				</Link>
			</header>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{cards.map((card) => (
					<Link key={card.id} href={`/buildings/${card.slug}`} className="group block">
						<div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
							<Image
								src={card.url}
								alt={card.title}
								fill
								sizes="(max-width: 768px) 50vw, 25vw"
								className="object-cover transition-transform group-hover:scale-105"
							/>
						</div>
						<p className="mt-2 text-sm">{card.title}</p>
					</Link>
				))}
			</div>
		</main>
	);
}
