#include "dhash.h"
namespace{
	uint8_t luminance(uint8_t r, uint8_t g, uint8_t b) {
		return static_cast<uint8_t>(0.299f * r + 0.587f * g + 0.114f * b);
	}
}
namespace imgcore{

	std::string dhash_hex(const uint8_t* rgba, int width, int height, int channels){
		return "";
	}
	uint64_t dhash(const uint8_t* rgba, int width, int height, int channels){
		std::vector<uint8_t> grey(width * height,0);
		for(int y = 0; y < height; y++){
			for(int x = 0; x < width; x++){
				int offset = (y * width + x) * channels;
				uint8_t r = rgba[offset + 0]; //bype at offset
				uint8_t g = rgba[offset + 1]; //byte at offset + 1
				uint8_t b = rgba[offset + 2]; //byte at offset + 2
				uint8_t lum = luminance(r,g,b);
				grey[y * width + x] = lum;
			}
		}
		const int outW = 9; outH = 8;
		std::vector<uint8_t> nineByEight(outW * outH);
	}
}