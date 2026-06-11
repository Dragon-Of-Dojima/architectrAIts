export function hammingHex(a: string, b:string): number{
	let x = BigInt('0x' + a) ^ BigInt('0x' + b);
	let count = 0;
	while(x > 0n){
		count += Number(x & 1n);
		x >>= 1n;
	}
	return count;
}