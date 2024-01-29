#pragma once
#include "genericModel.h"

struct model : genericModel {
  bool checkModelFiles();
  VoskModel* mdl{};
  model(const std::string& storepath, const std::string& id);
  bool checkModelId();
  bool afterFetch(int addr, size_t size);
  ~model();
};



