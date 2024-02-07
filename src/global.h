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
static bool OPFSOk{};
void fireEv(const char *type, const char *content, int index);
int main();

struct reusableThrd { // A minimal std::thread wrapper to run exactly 2 tasks
  static ProxyingQueue pq;
  std::thread thrd;
  std::atomic_flag blocker{};
  std::atomic_flag done{};
  reusableThrd();
  void addTask(std::function<void()> task);
  ~reusableThrd();
};
