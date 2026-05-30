import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 3301; //cast as number bc process.env.PORT is always a string when set

app.use(cors({ origin: ['http://localhost:3300'] }));
app.use(express.json());
app.get('/health', function (_req, res) {//_req signals non-use
	res.json({ status: 'ok', uptime: process.uptime() });
});
app.listen(PORT, function () {
	console.log('app listening on port', PORT);
});
