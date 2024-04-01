#pragma once
#include "link.h"

#include <filesystem>
#include <variant>
#include <fcntl.h>

#include <vosk_api.h>
#include <emscripten/console.h>
#include <archive.h>
#include <archive_entry.h>
namespace fs = std::filesystem;

extern void free(void*);
struct genericModel {
  bool normalMdl;
  bool resourceUsed{};
  std::atomic_bool blocker{};
  int index;
  std::string storepath;
  std::string id;
  std::variant<VoskModel*, VoskSpkModel*> mdl;
  std::function<void()> func;
  archive_entry* entry;
  void extractAndLoad(int tarStart, int tarSize);
  genericModel(int index, bool normalMdl, std::string storepath, std::string id);
  ~genericModel();
};

