#pragma once
#include "genericModel.h"

struct spkModel : genericModel {
  bool checkModelFiles();
  VoskSpkModel* mdl{};
  spkModel(const std::string& storepath, const std::string& id, int index);
  void checkModel();
  void afterFetch();
  void load(bool newTask);
  ~spkModel();
};
