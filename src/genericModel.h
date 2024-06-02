#pragma once
#include "util.h"

#include <vosk_api.h>

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
  void extractAndLoad(int tarStart, int tarSize);
  int findWord(std::string word);
  genericModel(int index, bool normalMdl, std::string storepath, std::string id);
  ~genericModel();
};

