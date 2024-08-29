#pragma once
#include "Util.h"

#include <vosk_api.h>

struct CommonModel {
  bool normalMdl;
  int index;
  std::string storepath;
  std::string id;
  std::variant<VoskModel*, VoskSpkModel*> mdl;
  void extractAndLoad(unsigned char* tarStart, int tarSize);
  int findWord(std::string word);
  CommonModel(int index, bool normalMdl, std::string storepath, std::string id, int tarStart, int tarSize);
  ~CommonModel();
};