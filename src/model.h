#pragma once
#include "genericModel.h"

struct model : genericModel {
  bool checkModelFiles();
  VoskModel* mdl{};
  model(const std::string& storepath, const std::string& id, int index);
  bool checkModel();
  void afterFetch();
  void load(bool newThrd);
  ~model();
};



