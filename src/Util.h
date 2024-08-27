#pragma once

#include <thread>
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
struct ThreadPool;
struct Thread {
  std::thread handle;
  std::function<void()> fn;
  void startup(ThreadPool* pool);
};
struct ThreadPool {
  bool qLock{true}; // True is locked, false is unlocked
  bool done{};
  std::queue<std::function<void()>> taskQ;
#ifndef MAX_THREADS
#define MAX_THREADS 1
#endif
  std::array<Thread, MAX_THREADS> threads;
#undef MAX_THREADS
  ThreadPool();
  ~ThreadPool();
  void exec(std::function<void()> fn);
};

extern ThreadPool globalPool;
void fireEv(int index, const char* content, const char* type = nullptr);
int untar(unsigned char* tar, int tarSize, const std::string& storepath);