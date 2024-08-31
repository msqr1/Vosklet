#pragma once
#include <filesystem>
#include <functional>
#include <variant>
#include <fstream>

#include <emscripten/atomic.h>
#include <emscripten/console.h>
namespace fs = std::filesystem;

struct AudioData {
  float* data;
  int len;
  AudioData(int start, int len) : data{reinterpret_cast<float*>(start)}, len{len} {}
};
enum UntarStatus {
  Successful,
  IncorrectFormat,
  IncorrectFiletype,
  FailedOpen,
  FailedWrite,
  FailedClose
};
struct WorkerPool;
struct Worker {
  int handle;
  std::function<void()> fn;
  static void startup(int _self, int _pool);
};
#ifndef MAX_WORKERS
#define MAX_WORKERS 1
#endif
struct WorkerPool {
  bool qLock{true}; // True is locked, false is unlocked
  bool done{};
  std::queue<std::function<void()>> taskQ;
  std::array<Worker, MAX_WORKERS> workers;
  WorkerPool();
  ~WorkerPool();
  void exec(std::function<void()> fn);
};
void fireEv(int index, const char* _content, const char* _type = nullptr);
int untar(unsigned char* tar, int tarSize, const std::string& storepath);

extern WorkerPool globalPool;