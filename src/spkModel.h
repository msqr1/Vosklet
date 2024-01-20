#pragma once
#include "genericModel.h"

struct spkModel : genericModel {
  bool checkModel();
  VoskSpkModel* mdl{};
  spkModel(const std::string &url, const std::string& storepath, const std::string& id);
  ~spkModel();
};



