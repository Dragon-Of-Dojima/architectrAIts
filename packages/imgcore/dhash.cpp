#include "dhash.h"
#include <stdexcept>
#include <sstream>
#include <iomanip>
namespace{
	uint8_t luminance(uint8_t r, uint8_t g, uint8_t b) {
		return static_cast<uint8_t>(0.299f * r + 0.587f * g + 0.114f * b);
	}
}
namespace imgcore{

	std::string dhash_hex(const uint8_t* rgba, int width, int height, int channels){
		uint64_t dhashValue = dhash(rgba,width,height,channels);
		std::ostringstream outputStringStream;
		outputStringStream << std::hex << std::setfill('0') << std::setw(16) << dhashValue; // << stream insertion operator
		/*
		could have written line 15 as
		outputStringStream << std::hex;
		outputStringStream << std::setfill('0');
		outputStringStream << std::setw(16);
		outputStringStream << value;
		*/
		return outputStringStream.str();
	}
	uint64_t dhash(const uint8_t* rgba, int width, int height, int channels){
		const int outW = 9, outH = 8;
		if(width < outW || height < outH){
			throw std::runtime_error("image too small");
		}
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
		std::vector<uint8_t> nineByEight(outW * outH, 0);

		for(int ty = 0; ty < outH; ty++){
			for(int tx = 0; tx < outW; tx++){
				int x0 = tx * width / outW;
				int x1 = (tx + 1) * width / outW;
				int y0 = ty * height / outH;
				int y1 = (ty + 1) * height / outH;
				int acc = 0;
				for(int blockY = y0; blockY < y1; blockY++){
					for(int blockX = x0; blockX < x1; blockX++){
						acc += grey[blockY * width + blockX];
					}
				}
				int count = (x1 - x0) * (y1 - y0);
				nineByEight[ty * outW + tx] = acc / count;
			}
		}
		uint64_t hash = 0;
		for(int row = 0; row < outH; row++){
			for(int col = 0; col < outW - 1;col++){
				bool bit = nineByEight[row * outW + col] < nineByEight[row * outW + (col + 1)];
				hash = (hash << 1) | (bit ? 1ULL : 0ULL); //U = unsigned, LL = long long
			}
		}
		return hash;
	}
}