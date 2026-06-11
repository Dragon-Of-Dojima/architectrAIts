import Link from 'next/link';

export default function Home() {
	return (
		<main className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
			<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">ArchitectrAIts</h1>
			<p className="mt-4 max-w-xl text-gray-500">
				An AI-powered catalog of traditional architecture. Browse the collection, or upload
				your own photo to identify its style and find the closest matches.
			</p>
			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				<Link
					href="/catalog"
					className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100 hover:text-gray-900"
				>
					Catalog Analysis
				</Link>
				<Link
					href="/analyze"
					className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100 hover:text-gray-900"
				>
					Analyze Your Photo
				</Link>
			</div>
		</main>
	);
}
