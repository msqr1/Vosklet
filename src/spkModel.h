#pragma once
#include "genericModel.h"

struct spkModel : genericModel {
  bool checkModelFiles();
  VoskSpkModel* mdl{};
  spkModel(const std::string& storepath, const std::string& id, int index);
  bool checkModel();
  void afterFetch();
  void load(bool newThrd);
  ~spkModel();
};
