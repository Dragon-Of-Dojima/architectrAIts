//const addon = require('./build/Release/imgcore_node.node');  // or imgcore_code.node
const addon = require('./index.js')
function makeBuf(width, height, valueAt) {
	const buf = Buffer.alloc(width * height * 4);
	for (let y = 0; y < height; y++)
	    for (let x = 0; x < width; x++) {
		   const o = (y * width + x) * 4;
		   const v = valueAt(x, y);
		   buf[o] = buf[o+1] = buf[o+2] = v;
		   buf[o+3] = 255;
	    }
	return buf;
 }

 function main(){
	const assert = require('assert');
	const W = 95, H = 85;
	assert.strictEqual(addon.dhashHex(makeBuf(W,H,()=>100), W,H), '0000000000000000'); // uniform
	assert.strictEqual(addon.dhashHex(makeBuf(W,H,(x)=>Math.floor(x*255/(W-1))), W,H), 'ffffffffffffffff'); // L→R
	assert.strictEqual(addon.dhashHex(makeBuf(W,H,(x,y)=>Math.floor(y*255/(H-1))), W,H), '0000000000000000'); // T→B
	console.log('addon OK');
 }
 main();