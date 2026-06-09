#pragma once
#include <string>
#include <cstdint>
#include <vector>
#include <cstddef>

namespace imgcore{
	std::string dhash_hex(const uint8_t* rgba, int width, int height, int channels);
	uint64_t dhash(const uint8_t* rgba, int width, int height, int channels);
}
