const createImgcore = require('./build/imgcore_wasm.js');

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

async function main() {
	function hashImage(bytes, w, h) {
		const ptr = Module._malloc(bytes.length);   // reserve space in WASM heap
		Module.HEAPU8.set(bytes, ptr);              // copy JS bytes -> WASM memory at ptr
		const hex = dhashHex(ptr, w, h, 4);         // pass the pointer (a number)
		Module._free(ptr);                          // give the memory back
		return hex;
	}
	
	const Module = await createImgcore();
	const dhashHex = Module.cwrap('dhash_hex_wasm', 'string', ['number', 'number', 'number', 'number']);
	const assert = require('assert');
	const W = 95, H = 85;
	assert.strictEqual(hashImage(makeBuf(W, H, () => 100), W, H), '0000000000000000');             // uniform
	assert.strictEqual(hashImage(makeBuf(W, H, x => Math.floor(x*255/(W-1))), W, H), 'ffffffffffffffff'); // L→R
	assert.strictEqual(hashImage(makeBuf(W, H, (x,y) => Math.floor(y*255/(H-1))), W, H), '0000000000000000'); // T→B
	console.log('wasm OK');
}
main();