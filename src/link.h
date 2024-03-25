#pragma once
#include <emscripten/em_asm.h>
#include <emscripten/proxying.h>
using namespace emscripten;


void fireEv(int index, const char* content, const char* type = nullptr); // Normal
void fireEv(int index, char* state, float* dataBuf); // For recognizer's success initialization
