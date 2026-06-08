'use client';

import { useState } from 'react';
import AnalysisResults, { type AnalysisResponse } from './AnalysisResults';

export default function AnalyzePage() {
	const [preview, setPreview] = useState<string | null>(null);
	const [result, setResult] = useState<AnalysisResponse | null>(null);
	const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

	async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		setPreview((old) => {
			if (old) URL.revokeObjectURL(old);
			return URL.createObjectURL(file);
		});

		setStatus('loading');
		setResult(null);
		try {
			const res = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'content-type': file.type },
				body: file,
			});
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			setResult(await res.json());
			setStatus('idle');
		} catch (err) {
			console.error(err);
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
			{status === 'error' && <p className="mt-6 text-red-600">Something went wrong. Try another image.</p>}
			
			{result && <AnalysisResults data={result} />}
		</main>
	);
}