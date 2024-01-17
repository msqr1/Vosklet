#pragma once

#include <emscripten.h>
#include <emscripten/console.h>

struct genericObj {
  const int index{};
  genericObj(int index) : index(index) {};
  void fireEv(const char *type, const char *content = nullptr);
};


