#pragma once
#include "genericObj.h"

#include <string>
#include <filesystem>
#include <fstream>
#include <thread>

#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
#include <emscripten/wasmfs.h>
#include <emscripten/bind.h>

namespace fs = std::filesystem;

struct genericModel : genericObj {
  static bool first;
  const std::string url{};
  const std::string id{};
  static bool extractModel();
  static bool checkId(const std::string& id);
  virtual bool checkModel() = 0;
  bool loadModel();
  genericModel(const std::string& url, const std::string& storepath, const std::string& id, int index);
};
