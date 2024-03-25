#pragma once
#include <emscripten/em_asm.h>
#include <emscripten/proxying.h>
using namespace emscripten;

void fireEv(int index, const char* content, const char* type = nullptr); // Normal
void fireEv(int index, std::atomic_int* state, float* dataBuf); // For recognizer's success initialization
