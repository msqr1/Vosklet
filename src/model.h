#pragma once
#include "genericModel.h"

class Model : public GenericModel {
  bool checkModel(const std::string& path);
public:
  VoskModel* model{};
  Model(const std::string &url, const std::string& storepath, const std::string& id, int index);
};



