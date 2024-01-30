#pragma once
#include "genericModel.h"

struct spkModel : genericModel {
  bool checkModelFiles();
  VoskSpkModel* mdl{};
  spkModel(const std::string& storepath, const std::string& id, int index);
  void checkModel();
  void afterFetch(int addr, size_t size);
  bool load();
  ~spkModel();
};
