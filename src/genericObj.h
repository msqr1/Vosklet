#pragma once
#include <emscripten.h>

class GenericObj {
  const int index{};
public:
  GenericObj(int index) : index(index) {};
  void fireEv(const char *type, const char *content = nullptr);
};


