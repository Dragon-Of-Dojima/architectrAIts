cmake_minimum_required(VERSION 3.16)
project(imgcore_node LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../imgcore imgcore_build)
set_target_properties(imgcore PROPERTIES POSITION_INDEPENDENT_CODE ON)
execute_process(
	COMMAND node -p "require('node-addon-api').include_dir"
	WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
	OUTPUT_VARIABLE NODE_ADDON_API_DIR
	OUTPUT_STRIP_TRAILING_WHITESPACE
)
add_library(${PROJECT_NAME} SHARED src/binding.cpp ${CMAKE_JS_SRC})
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_include_directories(${PROJECT_NAME} PRIVATE
	${CMAKE_JS_INC}
	${NODE_ADDON_API_DIR})
target_link_libraries(${PROJECT_NAME} PRIVATE imgcore ${CMAKE_JS_LIB})
target_compile_definitions(${PROJECT_NAME} PRIVATE NAPI_VERSION=8)