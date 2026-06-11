'use client';

import { useState } from 'react';
import AnalysisResults, { type AnalysisResponse } from './AnalysisResults';
import Spinner from '../components/Spinner';
import LinkButton from '../components/LinkButton';

// Keep in sync with the server-side cap (express.raw limit in apps/api). The
// server stays authoritative; this is a fast-fail so users don't upload a
// doomed file over the wire.
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export default function AnalyzePage() {
	const [preview, setPreview] = useState<string | null>(null);
	const [result, setResult] = useState<AnalysisResponse | null>(null);
	const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
	const [errorMsg, setErrorMsg] = useState('Something went wrong. Try another image.');

	async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		setPreview((old) => {
			if (old) URL.revokeObjectURL(old);
			return URL.createObjectURL(file);
		});

		if (file.size > MAX_UPLOAD_BYTES) {
			setResult(null);
			setErrorMsg(`Image is too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB). Try a smaller photo.`);
			setStatus('error');
			return;
		}

		setStatus('loading');
		setResult(null);
		try {
			const res = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'content-type': file.type },
				body: file,
			});
			if (res.status === 413) {
				setErrorMsg('Image is too large. Try a smaller photo.');
				setStatus('error');
				return;
			}
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			setResult(await res.json());
			setStatus('idle');
		} catch (err) {
			console.error(err);
			setErrorMsg('Something went wrong. Try another image.');
			setStatus('error');
		}
	}

	return (
		<main className="max-w-4xl mx-auto p-6 flex flex-1 flex-col items-center justify-center text-center">
			<LinkButton href="/" className="mb-6">Home</LinkButton>
			<h1 className="font-serif text-2xl font-semibold mb-4">Analyze a building photo</h1>
			<label className="inline-block cursor-pointer rounded-md bg-[var(--btn)] px-5 py-2.5 text-sm font-medium text-[var(--btn-fg)] transition hover:bg-[var(--btn-hover)] font-serif">
				Choose a photo
				<input type="file" accept="image/*" onChange={onFileChange} className="sr-only" />
			</label>

			{!preview && !result && status !== 'loading' && (
				<section className="mt-12 w-full max-w-3xl">
					<h2 className="font-serif text-lg font-semibold">How it works</h2>
					<ol className="mt-6 flex flex-col gap-6 text-left sm:flex-row">
						{[
							{ title: 'Upload a building photo', desc: 'Choose any photo of a building facade.' },
							{ title: 'AI identifies the style', desc: 'It estimates the architectural style, era, and likely period.' },
							{ title: 'See similar buildings', desc: 'Browse the closest matches from the catalog.' },
						].map((step, i) => (
							<li key={i} className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
								<span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--btn)] font-serif text-sm font-semibold text-[var(--btn-fg)]">
									{i + 1}
								</span>
								<h3 className="mt-3 font-serif text-base font-semibold">{step.title}</h3>
								<p className="mt-1 text-sm text-muted">{step.desc}</p>
							</li>
						))}
					</ol>
				</section>
			)}

			{/* blob: preview -> plain <img>, since next/image can't optimize blob URLs */}
			{preview && <img src={preview} alt="Your upload" className="mt-6 max-h-80 rounded" />}

			{status === 'loading' && <Spinner label="Analyzing…" className="mt-6" />}
			{status === 'error' && <p className="mt-6 text-red-600">{errorMsg}</p>}
			
			{result && <AnalysisResults data={result} />}
		</main>
	);
}