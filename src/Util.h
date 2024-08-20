#pragma once
#include <thread>
#include <filesystem>
#include <functional>
#include <variant>
#include <unistd.h>

#include <fcntl.h>
#include <emscripten/em_asm.h>
#include <emscripten/console.h>

namespace fs = std::filesystem;
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