#pragma once
#include "genericModel.h"

struct spkModel : genericModel {
  bool checkModel();
  spkModel(const std::string &url, const std::string& storepath, const std::string& id, const int index);
  VoskSpkModel* mdl{};
};



