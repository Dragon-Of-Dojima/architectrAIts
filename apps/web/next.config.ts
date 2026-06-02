import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
	// Emit a self-contained server build for Docker (no node_modules at runtime).
	output: 'standalone',
	// In a monorepo, point file tracing at the repo root so workspace packages
	// (architectraits-db / -storage) are included in the standalone output.
	outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
	transpilePackages: ['architectraits-db', 'architectraits-storage'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				// Virtual-hosted-style host the AWS SDK signs against.
				hostname: 'tradarchitecture-062214186260-us-east-1-an.s3.us-east-1.amazonaws.com',
				pathname: '/**',
				// `search` is intentionally omitted: presigned URLs carry a
				// time-based signature query string that changes each request.
			},
		],
	},
};

export default nextConfig;
