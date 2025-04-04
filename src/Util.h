#pragma once
#include <filesystem>
#include <variant>
#include <fstream>
#include <functional>
#include <queue>

#include "emscripten/atomic.h"
#include "emscripten/console.h"

namespace fs = std::filesystem;
enum Event {
  // Shared
  status,

  // Recognizer
  partialResult,
  result,
};
enum UntarStatus {
  Successful,
  IncorrectFormat,
  IncorrectFiletype,
  FailedOpen,
  FailedWrite,
  FailedClose
};
struct AudioData {
  float* data;
  int len;
  AudioData(int start, int len) : data{reinterpret_cast<float*>(start)}, len{len} {}
};

#ifndef MAX_WORKERS
#define MAX_WORKERS 1
#endif
struct WorkerPool {
  bool qLock{true}; // True is locked, false is unlocked
  bool done{};
  std::queue<std::function<void()>> taskQ;
  WorkerPool();
  ~WorkerPool();
  void exec(std::function<void()> fn);
};
extern "C" void fireEv(int idx, int typeIdx, const char* content = nullptr);

int untar(unsigned char* tar, int tarSize, const char* storepath);

extern WorkerPool globalPool;