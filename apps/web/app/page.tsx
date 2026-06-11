import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
	return (
		<main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
			<Image
				src="/hero-capriccio.jpg"
				alt="Bernardo Bellotto, Architectural Capriccio"
				fill
				priority
				sizes="100vw"
				className="-z-10 object-cover"
			/>
			<div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/40 to-black/65" />

			<h1 className="font-serif text-5xl font-bold tracking-tight text-white drop-shadow-sm sm:text-6xl">
				ArchitectrAIts
			</h1>
			<p className="mt-4 max-w-xl text-white/80">
				An AI-powered catalog of traditional architecture. Browse the collection, or upload
				your own photo to identify its style and find the closest matches.
			</p>
			<div className="mt-8 flex flex-col gap-3">
				<Link
					href="/catalog"
					className="rounded-md bg-[var(--btn)] px-5 py-2.5 font-serif text-sm font-medium text-[var(--btn-fg)] ring-1 ring-white/20 transition hover:bg-[var(--btn-hover)]"
				>
					Catalog Analysis
				</Link>
				<Link
					href="/analyze"
					className="rounded-md bg-[var(--btn)] px-5 py-2.5 font-serif text-sm font-medium text-[var(--btn-fg)] ring-1 ring-white/20 transition hover:bg-[var(--btn-hover)]"
				>
					Analyze Your Photo
				</Link>
			</div>

			<p className="absolute bottom-2 right-3 text-[10px] tracking-wide text-white/40">
				Bernardo Bellotto, Architectural Capriccio (c. 1765) · CC0
			</p>
		</main>
	);
}
