import Image from 'next/image';
import Link from 'next/link';

export type AnalysisResponse = {
	analysis: {
		primaryStyle: string;
		era: string | null;
		yearBuiltEstimate: number | null;
		description: string;
	};
	matches: { slug: string; title: string; url: string }[];
};

export default function AnalysisResults({ data }: { data: AnalysisResponse }) {
	const { analysis, matches } = data;
	return (
		<section className="mt-8">
			<h2 className="font-serif text-xl font-semibold">{analysis.primaryStyle}</h2>
			<p className="text-sm text-muted">
				{[analysis.era, analysis.yearBuiltEstimate].filter(Boolean).join(' · ')}
			</p>
			<p className="mt-2">{analysis.description}</p>

			{matches.length > 0 && (
				<>
					<h3 className="font-serif text-lg font-semibold mt-8 mb-4">Closest matches in the catalog</h3>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						{matches.map((m) => (
							<Link key={m.slug} href={`/buildings/${m.slug}`} className="block group">
								<div className="relative aspect-[3/2] overflow-hidden rounded">
									<Image src={m.url} alt={m.title} fill sizes="(max-width: 768px) 50vw, 33vw"
										className="object-cover transition-transform group-hover:scale-105" />
								</div>
								<p className="mt-2 text-sm">{m.title}</p>
							</Link>
						))}
					</div>
				</>
			)}
		</section>
	);
}