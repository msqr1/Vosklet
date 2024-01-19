#include "genericModel.h"

genericModel::genericModel(const std::string &url, const std::string& storepath, const std::string &id, int index) : url(url), id(id), genericObj(index) {
  fs::current_path("/opfs");
  fs::create_directories(storepath);
  fs::current_path(storepath);
}
bool genericModel::checkId(const std::string& id) {
  std::ifstream file {"id", std::ifstream::binary}; 
  if(!file.is_open()) {
    return false;
  };
  long long size {file.seekg(0, std::ios::end).tellg()};
  std::string oldid(size, ' ');
  file.seekg(0);
  file.read(&oldid[0], size);
  return id.compare(oldid) == 0 ? true : false;
}
bool genericModel::loadModel(const std::string& storepath) {
  if(!checkModel() || !checkId(id)) {
    char filename[] {"/opfs/XXXXXX.tzst"};
    close(mkostemps(filename, 5, O_PATH));
    if(emscripten_wget(url.c_str(),filename) == 1) {
      fireEv("error", "Unable to fetch model");
      return false;
    }
    if(!extractModel(filename)) {
      fireEv("error", "Unable to extract model");
      return false;
    }
    fs::remove(filename);
    if(!checkModel()) {
      fireEv("error", "Model URL contains invalid model files");
      fs::current_path("/opfs");
      fs::remove_all(storepath);
      return false;
    }
    std::ofstream idFile("id");
    if(!idFile.is_open()) {
      fireEv("error", "Unable to write new id");
      fs::remove_all(storepath);
      return false;
    }
    idFile << id;
  }
  return true;
}
bool genericModel::extractModel(char* name) {
  std::string path{};
  archive* src {archive_read_new()};
  archive_entry* entry {};
  archive_read_support_filter_all(src);
  archive_read_support_format_all(src);
  archive_read_open_filename(src, name,10240);
  if(archive_errno(src) != 0) return false;
  while (archive_read_next_header(src, &entry) == ARCHIVE_OK) {
    path = archive_entry_pathname(entry);
    // Strip first component
    archive_entry_set_pathname(entry, path.substr(path.find("/")).c_str());
    if(archive_errno(src) != 0) return false;
    archive_read_extract(src, entry, ARCHIVE_EXTRACT_UNLINK);
  }
  archive_read_free(src);
  return true;
}