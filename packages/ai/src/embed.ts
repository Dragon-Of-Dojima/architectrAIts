// packages/ai/src/embed.ts
import { AutoProcessor, SiglipVisionModel, RawImage, env } from '@huggingface/transformers';

const MODEL_ID = 'Xenova/siglip-base-patch16-224';

if (process.env.HF_CACHE_DIR) {
	env.cacheDir = process.env.HF_CACHE_DIR;
}

// Lazy, load-once singletons (the model + processor are heavy)
let processorPromise: ReturnType<typeof AutoProcessor.from_pretrained> | undefined;
let modelPromise: ReturnType<typeof SiglipVisionModel.from_pretrained> | undefined;

export async function embedImage(imageUrl: string): Promise<number[]> {
	processorPromise ??= AutoProcessor.from_pretrained(MODEL_ID);
	modelPromise ??= SiglipVisionModel.from_pretrained(MODEL_ID);
	const [processor, model] = await Promise.all([processorPromise, modelPromise]);

	const image = await RawImage.read(imageUrl);          // fetches the presigned URL + decodes
	const inputs = await processor(image);
	const { pooler_output } = await model(inputs);        // Tensor, dims [1, 768]

	// SigLIP's pooled output is NOT normalized -> L2-normalize for cosine distance
	const raw = Array.from(pooler_output.data as Float32Array);
	const norm = Math.sqrt(raw.reduce((s, x) => s + x * x, 0)) || 1;
	const vec = raw.map((x) => x / norm);

	if (vec.length !== 768) {
		throw new Error(`Expected 768-d embedding, got ${vec.length}`);
	}
	return vec;
}