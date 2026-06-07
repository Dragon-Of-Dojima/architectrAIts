ALTER TABLE "buildings" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
CREATE INDEX "buildings_embedding_idx" ON "buildings" USING hnsw ("embedding" vector_cosine_ops);