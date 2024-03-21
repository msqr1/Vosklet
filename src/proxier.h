#pragma once
#include <thread>
#include <mutex>
#include <queue>

#include <emscripten/wasmfs.h>
#include <emscripten/console.h>
#include <emscripten/em_asm.h>
#include <emscripten/proxying.h>
using namespace emscripten;

extern pthread_t dstThrd;
extern ProxyingQueue glbQ;

void fireEv(int index, const char* content, const char* type = nullptr);
struct reusableThrd { 
  std::queue<std::function<void()>> queue{};
  bool done{};
  void addTask(std::function<void()>&& task);
  reusableThrd();
  ~reusableThrd();
};