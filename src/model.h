#pragma once
#include "genericModel.h"

struct model : genericModel {
  bool checkModel();
  VoskModel* mdl{};
  model(const std::string &url, const std::string& storepath, const std::string& id, int index);
  ~model();
};



