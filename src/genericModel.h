#pragma once
#include "global.h"

#include <string>
#include <filesystem>
#include <fstream>

#include <fcntl.h>
#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
namespace fs = std::filesystem;

struct genericModel {
  const std::string storepath{};
  const std::string id{};
  reusableThrd thrd{};
  bool recognizerUsedThrd{};
  int index{};
  static bool extractModel();
  virtual bool checkModelFiles() = 0;
  virtual void load(bool) = 0;
  bool checkModel();
  void afterFetch();
  genericModel(const std::string &storepath, const std::string &id, int index);
};

