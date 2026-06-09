#include <iostream>
#include <vector>
#include <cassert>
#include "dhash.h"
#include <functional>

int main(){
	int height = 85;
	int width = 95;
	int channels = 4;
	const int testConstant = 100;
	std::vector<uint8_t> testBuffer(width * height * channels);
	for(int y = 0; y < height; y++){
		for(int x = 0; x < width; x++){
			int offset = (y * width + x) * channels;
			testBuffer[offset + 0] = testConstant;
			testBuffer[offset + 1] = testConstant;
			testBuffer[offset + 2] = testConstant;
			testBuffer[offset + 3] = 255;
		}
	}
	std::string result = imgcore::dhash_hex(testBuffer.data(),width,height,channels);
	std::cout << "uniform: " << result << std::endl;
	assert(result == "0000000000000000");

	for (int y = 0; y < height; y++) {
		for (int x = 0; x < width; x++) {
			int offset = (y * width + x) * channels;
			uint8_t v = static_cast<uint8_t>(x * 255 / (width - 1));  // brightness rises with column
			testBuffer[offset + 0] = v;
			testBuffer[offset + 1] = v;
			testBuffer[offset + 2] = v;
			testBuffer[offset + 3] = 255;
		}
	 }
	std::string lr = imgcore::dhash_hex(testBuffer.data(), width, height, channels);
	std::cout << "L->R: " << lr << std::endl;
	assert(lr == "ffffffffffffffff");

	for (int y = 0; y < height; y++) {
		for (int x = 0; x < width; x++) {
			int offset = (y * width + x) * channels;
			uint8_t v = static_cast<uint8_t>(y * 255 / (height - 1));  // brightness rises with column
			testBuffer[offset + 0] = v;
			testBuffer[offset + 1] = v;
			testBuffer[offset + 2] = v;
			testBuffer[offset + 3] = 255;
		}
	 }
	std::string tb = imgcore::dhash_hex(testBuffer.data(), width, height, channels);
	std::cout << "T->B: " << tb << std::endl;
	assert(tb == "0000000000000000");
};