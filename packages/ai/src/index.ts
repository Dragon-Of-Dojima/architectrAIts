import OpenAI from 'openai';
import { z } from 'zod';

const schema = z.object({
	primaryStyle: z.string().min(1),
	era: z.string().nullable(),
	yearBuiltEstimate: z.number().int().nullable(),
	description: z.string().min(1),
});

export type BuildingDescription = z.infer<typeof schema>;

const PROMPT = `You are an architectural historian classifying a photograph of a building.

Identify the building's traditional architectural style and return a single JSON object with exactly these keys:
- "primaryStyle": the established, canonical name of the building's architectural style, in Title Case, singular, with no trailing words like "style" or "architecture" (e.g. "Korean Hanok", "Wayo", "Chinese Renaissance", "Second Empire", "Italianate-Eclectic", "Neoclassical", "Art Nouveau"). If the style is unclear, use "Unknown".
- "era": the historical period or dynasty if identifiable (e.g. "Joseon Dynasty", "Meiji period", "19th century"), otherwise null.
- "yearBuiltEstimate": your best integer estimate of the year the building was constructed, or null if you cannot estimate.
- "description": two to three sentences describing the building's notable architectural features.

Respond with ONLY the JSON object. No markdown, no code fences, no commentary.`;

export async function describeBuilding(imageURL: string): Promise<BuildingDescription> {
	const model = process.env.OPENROUTER_VISION_MODEL;
	if (!model) {
		throw new Error('OPENROUTER_VISION_MODEL is not set');
	}
	if (!process.env.OPENROUTER_API_KEY) {
		throw new Error('OPENROUTER_API_KEY is not set');
	}

	const openAIInstance = new OpenAI({
		apiKey: process.env.OPENROUTER_API_KEY,
		baseURL: 'https://openrouter.ai/api/v1',
	});

	const response = await openAIInstance.chat.completions.create({
		model,
		temperature: 0,
		max_tokens: 600,
		messages: [
			{
				role: 'user',
				content: [
					{ type: 'text', text: PROMPT },
					{ type: 'image_url', image_url: { url: imageURL } },
				],
			},
		],
	});

	const raw = response.choices[0]?.message?.content;
	if (!raw) {
		throw new Error('Model returned no content');
	}

	// Anthropic-via-OpenRouter sometimes wraps JSON in prose or code fences,
	// so slice from the first "{" to the last "}" before parsing.
	const start = raw.indexOf('{');
	const end = raw.lastIndexOf('}');
	if (start === -1 || end === -1) {
		throw new Error(`Model did not return JSON: ${raw}`);
	}

	return schema.parse(JSON.parse(raw.slice(start, end + 1)));
}
