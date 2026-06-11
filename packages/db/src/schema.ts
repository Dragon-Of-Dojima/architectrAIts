import { pgTable, uuid, text, integer, boolean, timestamp, vector, index } from 'drizzle-orm/pg-core';

export const buildings = pgTable('buildings', { 
	id : uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	era: text('era'),
	primary_style: text('primary_style'),
	yearBuiltEstimate: integer('year_built_estimate'),
	sourceUrl: text('source_url'),
	license: text('license'),
	editedByHuman: boolean('edited_by_human').notNull().default(false),
	ingestedAt: timestamp('ingested_at',{withTimezone:true}).notNull().defaultNow(),
	description:text('description'),
	ai_model:text('ai_model'),
	ai_processed_at:timestamp('ai_processed_at',{withTimezone:true}),
	embedding: vector('embedding',{dimensions:768})
},(t)=>[index('buildings_embedding_idx').using('hnsw', t.embedding.op('vector_cosine_ops')),]
);
export const images = pgTable('images', { 
	id: uuid('id').primaryKey().defaultRandom(),
	buildingId: uuid('building_id').notNull().references(() => buildings.id, { onDelete: 'cascade' }),
	s3Key: text('s3_key').notNull(),
	width: integer('width'),
	height: integer('height'),
	dhash: text('dhash'),
	ingestedAt: timestamp('ingested_at',{withTimezone:true}).notNull().defaultNow()
});