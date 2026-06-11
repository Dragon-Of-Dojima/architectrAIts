import 'dotenv/config';
import { runDhashes } from '../src/jobs.js';

runDhashes()
	.then(() => {
		console.log('dHash complete');
		process.exit(0);
	})
	.catch((e) => {
		console.log(e);
		process.exit(1);
	});
