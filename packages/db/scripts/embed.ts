import 'dotenv/config';
import { runEmbeddings } from '../src/jobs.js';

runEmbeddings()
	.then(() => {
		console.log('Embed complete');
		process.exit(0);
	})
	.catch((e) => {
		console.log(e);
		process.exit(1);
	});
