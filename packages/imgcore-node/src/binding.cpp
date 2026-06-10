#include <napi.h>
#include "dhash.h"

Napi::Value DhashHex(const Napi::CallbackInfo& info){
	Napi::Env env = info.Env();
	if (info.Length() < 4 || !info[0].IsBuffer() || !info[1].IsNumber() || !info[2].IsNumber() || !info[3].IsNumber()) {
		Napi::TypeError::New(env, "expected (Buffer, width, height, channels)").ThrowAsJavaScriptException();
		return env.Null();
	}
	Napi::Buffer<uint8_t> buf = info[0].As<Napi::Buffer<uint8_t>>();
	const uint8_t* rgba = buf.Data();      // <-- exactly what your core wants
	size_t byteLen = buf.Length();
	int width    = info[1].As<Napi::Number>().Int32Value();
	int height   = info[2].As<Napi::Number>().Int32Value();
	int channels = info[3].As<Napi::Number>().Int32Value();
	try {
		std::string hash = imgcore::dhash_hex(rgba, width, height, channels);
		return Napi::String::New(env, hash);
	} catch (const std::exception& e) {
		Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
		return env.Null();
	}
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set(Napi::String::New(env, "dhashHex"), Napi::Function::New(env, DhashHex));
	return exports;
 }
NODE_API_MODULE(architectraits_imgcore_node, Init)