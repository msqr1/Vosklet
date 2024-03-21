#pragma once
#include "proxier.h"

#include <filesystem>
#include <fstream>
#include <fcntl.h>
#include <variant>

#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
namespace fs = std::filesystem;
struct genericModel {
  bool normalMdl;
  bool recognizerUsedThrd{};
  int index;
  std::string storepath;
  std::string id;
  std::variant<VoskModel*, VoskSpkModel*> mdl;
  reusableThrd thrd;
  archive_entry* entry;
  void extractAndLoad(int tarStart, int tarSize);
  genericModel(int index, bool normalMdl, std::string storepath, std::string id);
  ~genericModel();
};

