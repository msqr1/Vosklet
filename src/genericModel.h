#pragma once
#include "genericObj.h"

#include <string>
#include <filesystem>
#include <fstream>
#include <thread>

#include <fcntl.h>
#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
#include <emscripten/wasmfs.h>
#include <emscripten/bind.h>

namespace fs = std::filesystem;

struct genericModel : genericObj {
  const std::string url{};
  const std::string id{};
  static bool extractModel(char *name);
  static bool checkId(const std::string& id);
  virtual bool checkModel() = 0;
  bool loadModel(const std::string& storepath);
  genericModel(const std::string &url, const std::string &storepath, const std::string &id, int index);
};
