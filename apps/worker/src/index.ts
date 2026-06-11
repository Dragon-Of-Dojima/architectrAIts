import 'dotenv/config';
import { discoverNewObjects, runDescriptions, runEmbeddings, runDhashes } from 'architectraits-db/jobs';

// Polling ingest worker. The database is the work queue: each step keys off a
// nullable column, so there's nothing to persist here beyond the loop itself.
const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS) || 60_000;
const runOnce = process.argv.includes('--once');

let running = false;
let shuttingDown = false;

async function tick(): Promise<void> {
	// Single-flight: if the previous tick is still going (a big backfill, a slow
	// OpenRouter call), skip this one rather than overlapping work.
	if (running) {
		console.log('[worker] previous tick still running, skipping');
		return;
	}
	running = true;
	try {
		const discovered = await discoverNewObjects();
		if (discovered > 0) {
			console.log(`[worker] discovered ${discovered} new object(s)`);
		}
		await runDescriptions();
		await runEmbeddings();
		await runDhashes();
	} catch (e) {
		console.log('[worker] tick failed:', e);
	} finally {
		running = false;
	}
}

async function main(): Promise<void> {
	console.log(`[worker] starting (interval ${POLL_INTERVAL_MS}ms${runOnce ? ', --once' : ''})`);

	await tick();

	if (runOnce) {
		console.log('[worker] --once complete');
		process.exit(0);
	}

	const timer = setInterval(() => {
		if (!shuttingDown) {
			void tick();
		}
	}, POLL_INTERVAL_MS);

	const shutdown = (signal: string) => {
		if (shuttingDown) {
			return;
		}
		console.log(`[worker] received ${signal}, finishing current work then exiting...`);
		shuttingDown = true;
		clearInterval(timer);
		// Let an in-flight tick complete before exiting.
		const waitForIdle = setInterval(() => {
			if (!running) {
				clearInterval(waitForIdle);
				process.exit(0);
			}
		}, 200);
	};

	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((e) => {
	console.log(e);
	process.exit(1);
});
