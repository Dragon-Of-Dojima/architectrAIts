import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 3301; //cast as number bc process.env.PORT is always a string when set

// interface HealthResponse{
// 	status: 'ok';
// 	uptime: number;
// }

app.use(cors({ origin: ['http://localhost:3300'] }));
app.use(express.json());
// app.get('/health', function (_req : Request, res: Response<HealthResponse>) {//_req signals non-use
// 	res.json({ status: 'ok', uptime: process.uptime() });
// });
 //could also do what's below **
 app.get('/health', (_req: Request, res: Response<{ status: string; uptime: number }>) => {
	res.json({ status: 'ok', uptime: process.uptime() });
});
app.listen(PORT, function () {
	console.log('app listening on port', PORT);
});
