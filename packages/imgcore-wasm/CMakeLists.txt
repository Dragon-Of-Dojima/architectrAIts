cmake_minimum_required(VERSION 3.16)
project(imgcore_wasm LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../imgcore imgcore_build)

add_executable(imgcore_wasm src/binding.cpp)
target_link_libraries(imgcore_wasm PRIVATE imgcore)

set_target_properties(imgcore_wasm PROPERTIES SUFFIX ".js")
target_link_options(imgcore_wasm PRIVATE
  "-sMODULARIZE=1"
  "-sEXPORT_NAME=createImgcore"
  "-sEXPORTED_FUNCTIONS=['_dhash_hex_wasm','_malloc','_free']"
  "-sEXPORTED_RUNTIME_METHODS=['cwrap','HEAPU8']"
  "-sALLOW_MEMORY_GROWTH=1"
)