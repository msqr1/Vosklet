#pragma once
#include <thread>
#include <atomic>

#include <emscripten.h>
#include <emscripten/wasmfs.h>

void throwJS(const char* msg, bool err = false);
int main();
