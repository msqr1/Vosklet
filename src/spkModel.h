#pragma once
#include "genericModel.h"

class SpkModel : public GenericModel {
  bool checkModel(const std::string& path);
public:
  SpkModel(const std::string &url, const std::string& storepath, const std::string& id, const int index);
  VoskSpkModel* model{};
};



