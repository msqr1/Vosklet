#pragma once
#include <thread>
#include <atomic>

#include <emscripten/wasmfs.h>
#include <emscripten/console.h>
#include <emscripten/em_asm.h>
#include <emscripten/proxying.h>
using namespace emscripten;

static pthread_t selfTID{pthread_self()};
static std::error_code tank{};
void throwJS(const char* msg, bool err = false);
void fireEv(const char *type, const char *content, int index);
int main();

struct twiceThrd { // A minimal std::thread wrapper to run exactly 2 tasks
  bool reusable{true};
  std::mutex blocker{};
  std::function<void()> task2{};
  void setTask1(std::function<void()> task1);
  void setTask2(std::function<void()> task2);
};
