#pragma once
#include <thread>
#include <atomic>
#include <queue>

#include <emscripten/wasmfs.h>
#include <emscripten/console.h>
#include <emscripten/em_asm.h>
#include <emscripten/proxying.h>
using namespace emscripten;

extern bool OPFSOk;
extern std::error_code tank;
extern pthread_t dstThrd;
extern ProxyingQueue glbQ;

void fireEv(const char *type, const char *content, int index);
int main();

struct reusableThrd { 
  std::queue<std::function<void()>> queue{};
  std::atomic_flag blocker{};
  std::atomic_flag done{};
  void addTask(std::function<void()> task);
  ~reusableThrd();
};
