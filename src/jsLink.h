#pragma once
#include <thread>
#include <mutex>
#include <queue>

#include <emscripten/wasmfs.h>
#include <emscripten/console.h>
#include <emscripten/em_asm.h>
#include <emscripten/proxying.h>
using namespace emscripten;

void fireEv(int index, const char* content, const char* type = nullptr);
