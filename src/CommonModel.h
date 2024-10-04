#pragma once
#include "Util.h"

#include "vosk_api.h"

struct CommonModel {
  bool normalMdl;
  int index;
  std::variant<VoskModel*, VoskSpkModel*> mdl;
  
  void extractAndLoad(unsigned char* tarStart, int tarSize);
  int findWord(std::string word);
  CommonModel(int index, bool normalMdl, int tarStart, int tarSize);
  ~CommonModel();
};