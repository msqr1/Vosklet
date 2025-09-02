#pragma once
#include <filesystem>
#include <variant>
#include <fstream>
#include <functional>
#include <queue>

#include "emscripten/atomic.h"
#include "emscripten/console.h"

namespace fs = std::filesystem;

enum UntarStatus
{
  Successful,
  IncorrectFormat,
  IncorrectFiletype,
  FailedOpen,
  FailedWrite,
  FailedClose
};

extern "C" void fireEv(int idx, const char *content = nullptr);

int untar(unsigned char *tar, int tarSize, const char *storepath);
