#pragma once
#include "global.h"

#include <string>
#include <filesystem>
#include <cstring>
#include <fcntl.h>
#include <variant>

#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
namespace fs = std::filesystem;

struct genericModel {
  bool normalMdl{};
  bool recognizerUsedThrd{};
  int index{};
  char* storepath{};
  char* id{};
  std::variant<VoskModel*, VoskSpkModel*> mdl{};
  reusableThrd thrd{};
  static bool extract();
  void load(bool newTask);
  void check();
  bool checkFiles();
  void afterFetch();
  genericModel(std::string storepath, std::string id, int index, bool normalMdl);
  ~genericModel();
};

