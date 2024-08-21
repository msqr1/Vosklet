#pragma once
#include <thread>
#include <filesystem>
#include <functional>
#include <variant>
#include <fstream>
#include <emscripten/em_asm.h>
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
void fireEv(int index, const char* content, const char* type = nullptr);
int untar(unsigned char* tar, int tarSize, const std::string& storepath);