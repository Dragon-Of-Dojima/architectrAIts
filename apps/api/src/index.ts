import 'dotenv/config';
import { describeBuilding, embedImageFromBlob } from 'architectraits-ai';
import express from 'express';
import type { Request, Response } from 'express';
import type { HealthResponse } from 'architectraits-shared';
import cors from 'cors';
import { dhashImage } from 'architectraits-shared/imgcore';

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
 app.get('/health', (_req: Request, res: Response<HealthResponse>) => {
	res.json({ status: 'ok', uptime: process.uptime() });
});
app.listen(PORT, function () {
	console.log('app listening on port', PORT);
});
app.post("/analyze",express.raw({ type: 'image/*', limit: '8mb' }),async function(req,res){
	const contentType = req.headers['content-type'] ?? '';
	const buff = req.body;

	if(!Buffer.isBuffer(buff) || buff.length == 0 || !contentType.startsWith('image/')){
		res.status(400).json({error:'Expected a non-empty image/* body'});
		return;
	}
	try{
		const dataURL = `data:${contentType};base64,${buff.toString('base64')}`;
		const blob = new Blob([buff],{type:contentType});
		const [analysis, embedding, dhash] = await Promise.all([
			describeBuilding(dataURL),
			embedImageFromBlob(blob),
			dhashImage(buff)
		]);
		res.json({analysis,embedding,dhash});
	}catch(e){
		console.log('[analyze] failed:',e);
		res.status(502).json({error:'Analysis failed'});
	}
})