#pragma once
#include <filesystem>
#include <variant>
#include <fstream>
#include <functional>

#include "emscripten/atomic.h"
#include "emscripten/console.h"

namespace fs = std::filesystem;

struct AudioData {
  float* data;
  int len;
  AudioData(int start, int len) : data{reinterpret_cast<float*>(start)}, len{len} {}
};
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
// Must be called from the main thread
extern "C" void mtFireEv(int index, int typeIdx, int content);

// Must be called from a wasm worker
void fireEv(int index, int typeIdx, const char* content = nullptr);

int untar(unsigned char* tar, int tarSize, const std::string& storepath);

extern WorkerPool globalPool;