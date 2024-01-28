#pragma once
#include "global.h"

#include <string>
#include <filesystem>
#include <fstream>

#include <fcntl.h>
#include <vosk_api.h>
#include <archive.h>
#include <archive_entry.h>
extern void throwJS(const char* msg, bool err);
namespace fs = std::filesystem;

struct genericModel {
  const std::string url{};
  const std::string id{};
  static bool extractModel();
  static bool checkId(const std::string& id);
  virtual bool checkModel() = 0;
  bool loadModel(const std::string& storepath);
  genericModel(const std::string &url, const std::string &storepath, const std::string &id);
};
struct fetchData {
  const std::string storepath{}; 
  std::atomic_flag* blocker{};
  bool* successful{};
  genericModel* self{};
  fetchData(const std::string& storepath, bool* successful, std::atomic_flag* blocker, genericModel* self);
};
