import 'dotenv/config';
import { runDescriptions } from '../src/jobs.js';

runDescriptions()
	.then(() => {
		console.log('Ingest complete');
		process.exit(0);
	})
	.catch((e) => {
		console.log(e);
		process.exit(1);
	});
