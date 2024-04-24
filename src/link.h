#pragma once
#include <thread>

#include <emscripten/em_asm.h>

void fireEv(int index, const char* content, const char* type = nullptr);
