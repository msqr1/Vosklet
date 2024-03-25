#pragma once
#include "link.h"

#include <string>
#include <filesystem>
#include <variant>
#include <thread>
#include <fcntl.h>

#include <emscripten/console.h>
#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
namespace fs = std::filesystem;

struct genericModel {
  bool normalMdl;
  bool resourceUsed{};
  int index;
  std::string storepath;
  std::string id;
  std::variant<VoskModel*, VoskSpkModel*> mdl;
  std::function<void()> func;
  std::mutex blocker{};
  archive_entry* entry;
  void extractAndLoad(int tarStart, int tarSize);
  genericModel(int index, bool normalMdl, std::string storepath, std::string id);
  ~genericModel();
};

