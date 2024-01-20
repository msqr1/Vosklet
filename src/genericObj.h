#pragma once

#include <emscripten.h>
#include <emscripten/console.h>
void throwErr(const char* msg) {
  EM_ASM({
    throw Error(UTF8ToString($0))
  },msg);
}



