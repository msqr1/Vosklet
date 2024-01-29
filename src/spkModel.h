#pragma once
#include "genericModel.h"

struct spkModel : genericModel {
  bool checkModelFiles();
  VoskSpkModel* mdl{};
  spkModel(const std::string& storepath, const std::string& id);
  bool checkModelId();
  bool afterFetch(int addr, size_t size);
  ~spkModel();
};



