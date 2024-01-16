#include "genericModel.h"

bool GenericModel::first = true;
GenericModel::GenericModel(const std::string &url, const std::string& storepath, const std::string &id, int index) : url(url), id(id), storepath(("opfs/" + storepath)), GenericObj(index) {
  if(first) {
    vosk_set_log_level(-1);
    int res{};
    std::thread t{[&res](){
      res = wasmfs_create_directory("opfs",0777,wasmfs_create_opfs_backend());
    }};
    t.join();
    if(res == 1){
      fireEv("error", "Unable to create OPFS directory");
      return;
    }
    first = false;
  }
}
bool GenericModel::checkId(const std::string& path, const std::string& id) {
  std::ifstream file {(path + "/id"), std::ifstream::binary}; 
  if(!file.is_open()) {
    return false;
  };
  long long size {file.seekg(0, std::ios::end).tellg()};
  std::string oldid(size, ' ');
  file.seekg(0);
  file.read(&oldid[0], size);
  return id.compare(oldid) == 0 ? true : false;
}
bool GenericModel::loadModel() {
  if(!checkModel(storepath) || !checkId(storepath, id)) {
    if(emscripten_wget(url.c_str(), "opfs/model.tzst") == 1) {
      fireEv("error", "Unable to fetch model");
      return false;
    }
    if(!extractModel("opfs/model.tzst", storepath)) {
      fireEv("error", "Unable to extract model");
    }
    fs::remove("opfs/model.tzst");
    if(!checkModel(storepath)) {
      fireEv("error", "Model URL contains invalid model files");
    }
    std::ofstream idFile((storepath + "/id"));
    if(!idFile.is_open()) {
      fireEv("error", "Unable to write new id");
      fs::remove_all(storepath);
      return false;
    }
    idFile << id;
  }
  return true;
}
bool GenericModel::extractModel(const char* target, const std::string& dest) {
  std::string path{};
  archive* src {archive_read_new()};
  archive_entry* entry {};
  archive_read_support_filter_all(src);
  archive_read_support_format_all(src);
  archive_read_open_filename(src, target,22480);
  if(archive_errno(src) != 0) return false;
  while (archive_read_next_header(src, &entry) == ARCHIVE_OK) {
    path = archive_entry_pathname(entry);
    archive_entry_set_pathname(entry, (dest + path.substr(path.find("/"))).c_str());
    if(archive_errno(src) != 0) return false;
    archive_read_extract(src, entry, ARCHIVE_EXTRACT_UNLINK);
  }
  archive_read_free(src);
  return true;
}