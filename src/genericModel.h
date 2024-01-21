#pragma once
#include <string>
#include <filesystem>
#include <fstream>
#include <thread>

#include <fcntl.h>
#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
#include <emscripten/wasmfs.h>
#include <emscripten.h>
extern void throwJS(const char* msg, bool err = false);
namespace fs = std::filesystem;

struct genericModel {
  const std::string url{};
  const std::string id{};
  static bool extractModel(char *name);
  static bool checkId(const std::string& id);
  virtual bool checkModel() = 0;
  bool loadModel(const std::string& storepath);
  genericModel(const std::string &url, const std::string &storepath, const std::string &id);
};
