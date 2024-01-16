#pragma once
#include "genericObj.h"

#include <string>
#include <thread>
#include <filesystem>
#include <fstream>

#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
#include <emscripten/wasmfs.h>
#include <emscripten/bind.h>

namespace fs = std::filesystem;

class GenericModel : public GenericObj {
  static bool first;
  const std::string url{};
  const std::string id{};
  static bool extractModel(const char* target, const std::string& dest);
  static bool checkId(const std::string& path, const std::string& id);
public:
  const std::string storepath{};
  virtual bool checkModel(const std::string& path) = 0;
  bool loadModel();
  GenericModel(const std::string& url, const std::string& storepath, const std::string& id, int index);
};
