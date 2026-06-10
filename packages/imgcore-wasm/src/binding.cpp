#include "dhash.h"
#include <string>
#include <cstdint>

extern "C" {
	const char* dhash_hex_wasm(const uint8_t* data, int width, int height, int channels) {
		//this setup endures that the dhx lives for program's lifetime & pointer stays valid,
		//but contents refresh each call
		static std::string dhx;
		dhx = imgcore::dhash_hex(data, width, height, channels);
		return dhx.c_str();
	}
}