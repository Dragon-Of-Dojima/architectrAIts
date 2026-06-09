'use client';

import { useState } from 'react';
import AnalysisResults, { type AnalysisResponse } from './AnalysisResults';

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
		<main className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Analyze a building photo</h1>
			<input type="file" accept="image/*" onChange={onFileChange} />
			{/* blob: preview -> plain <img>, since next/image can't optimize blob URLs */}
			{preview && <img src={preview} alt="Your upload" className="mt-6 max-h-80 rounded" />}

			{status === 'loading' && <p className="mt-6">Analyzing…</p>}
			{status === 'error' && <p className="mt-6 text-red-600">{errorMsg}</p>}
			
			{result && <AnalysisResults data={result} />}
		</main>
	);
}