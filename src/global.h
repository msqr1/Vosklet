#pragma once
#include <thread>
#include <atomic>

#include <emscripten/wasmfs.h>
#include <emscripten/console.h>
#include <emscripten/em_asm.h>
#include <emscripten/proxying.h>

using namespace emscripten;
void throwJS(const char* msg, bool err = false);
void fireEv(const char *type, const char *content, int index);
int main();
