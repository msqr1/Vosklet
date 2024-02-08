#include "genericModel.h"

genericModel::genericModel(const std::string& storepath, const std::string &id, int index) : storepath(storepath), id(id), index(index) {
  if(!OPFSOk) {
    fireEv("_continue", "OPFS isn't initialized or unavailable", index);
    return;
  }
  fs::current_path("/opfs", tank);
  if(tank.value() != 0) {
    fireEv("_continue","Unable to cd OPFS root", index);
    return;
  }
  fs::create_directories(storepath, tank);
  if(tank.value() != 0) {
    fireEv("_continue","Unable to create storepath", index);
  }
  fs::current_path(storepath, tank); 
  if(tank.value() != 0) {
    fireEv("_continue", "Unable to cd storepath", index);
  }
}
bool genericModel::checkModel() {
  if(!checkModelFiles()) return false;
  if(!fs::exists("id", tank)) return false;
  std::ifstream file {"id", std::ifstream::binary}; 
  if(!file.is_open()) return false;
  long long size {file.seekg(0, std::ios::end).tellg()};
  std::string oldid(size, ' ');
  file.seekg(0);
  file.read(&oldid[0], size);
  return id.compare(oldid) == 0;
}
void genericModel::afterFetch() {
  thrd.addTask([this](){
    if(!extractModel()) {
      fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      fireEv("_continue", "Unable to extract model", index);
      return;
    }
    fs::remove("/opfs/m0dEl.tar",tank);
    fs::remove("README",tank);
    if(!checkModelFiles()) {
      fireEv("_continue", "URL contains invalid model files", index);
      return;
    }
    std::ofstream idFile("id");
    if(!idFile.is_open()) {
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      fireEv("_continue", "Unable to write model ID", index);
      return;
    }
    idFile << id;
    idFile.close();
    load(false);
  });
}
bool genericModel::extractModel() {
  std::string path{};
  archive* src {archive_read_new()};
  archive_entry* entry{};
  int fd{};
  archive_read_support_format_tar(src);
  archive_read_open_filename(src, "/opfs/m0dEl.tar", 10240);
  if(archive_errno(src) != 0) return false;
  while(archive_read_next_header2(src, entry) == ARCHIVE_OK) {
    path = archive_entry_pathname(entry);
    // Strip 1st component, keep relative path
    path = "." + path.substr(path.find("/")); 
    if(!fs::path(path).has_extension()) {
      fs::create_directory(path);
      continue;
    }
    fd = open(path.c_str(), O_CREAT | O_WRONLY | O_TRUNC);
    archive_read_data_into_fd(src, fd);
    close(fd);
    if(archive_errno(src) != 0) {
      emscripten_console_log(archive_error_string(src));
      return false;
    }
  }
  archive_read_free(src);
  return true;
}