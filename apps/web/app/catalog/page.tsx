import { eq, desc, sql } from 'drizzle-orm';
import { db, buildings, images } from 'architectraits-db';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPresignedImageUrl } from 'architectraits-storage';
import LinkButton from '../components/LinkButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Catalog' };

const PAGE_SIZE = 8;

export default async function CatalogPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page: pageParam } = await searchParams;

	const countRows = await db
		.select({ value: sql<number>`count(*)` })
		.from(buildings)
		.innerJoin(images, eq(images.buildingId, buildings.id));
	const total = Number(countRows[0]?.value ?? 0);
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

	const rows = await db
		.select({
			id: buildings.id,
			title: buildings.title,
			slug: buildings.slug,
			s3Key: images.s3Key,
		})
		.from(buildings)
		.innerJoin(images, eq(images.buildingId, buildings.id))
		.orderBy(desc(buildings.title))
		.limit(PAGE_SIZE)
		.offset((page - 1) * PAGE_SIZE);

	const cards = await Promise.all(
		rows.map(async (row) => ({ ...row, url: await getPresignedImageUrl(row.s3Key) })),
	);

	return (
		<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center p-6">
			<header className="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
				<h1 className="font-serif text-3xl font-bold tracking-tight">Catalog</h1>
				<LinkButton href="/">Home</LinkButton>
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

			<nav className="mt-10 flex items-center justify-center gap-6">
				<LinkButton href={`/catalog?page=${page - 1}`} disabled={page <= 1}>
					← Prev
				</LinkButton>
				<span className="text-sm text-muted">
					Page {page} of {totalPages}
				</span>
				<LinkButton href={`/catalog?page=${page + 1}`} disabled={page >= totalPages}>
					Next →
				</LinkButton>
			</nav>
		</main>
	);
}
