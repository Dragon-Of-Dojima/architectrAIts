import sharp from 'sharp';
import {dhashHex} from 'architectraits-imgcore-node';

export async function dhashImage(bytes: Buffer): Promise<string>{
	const {data, info} = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject: true});
	return dhashHex(data, info.width, info.height, info.channels);
}