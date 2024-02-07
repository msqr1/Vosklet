#include "genericModel.h"

genericModel::genericModel(const std::string& storepath, const std::string &id, int index) : storepath(storepath), id(id), index(index) {
  fs::current_path("/opfs", tank);
  if(tank.value() != 0) {
    throwJS("Unable to cd OPFS root");
    return;
  }
  fs::create_directories(storepath, tank);
  if(tank.value() != 0) {
    throwJS("Unable to create storepath");
  }
  fs::current_path(storepath, tank); 
  if(tank.value() != 0) {
    throwJS("Unable to cd storepath");
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
  return id.compare(oldid) == 0 ? true : false;
}
void genericModel::afterFetch() {
  thrd.setTask1([this](){
    if(!extractModel()) {
      fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      fireEv("_continue", "Unable to extract model", index);
      return;
    }
    fs::remove("/opfs/m0dEl.tar",tank);
    fs::remove("README",tank);
    std::ofstream idFile("id");
    if(!idFile.is_open()) {
      fs::current_path("/opfs");
      fs::remove_all(storepath);
      fireEv("_continue", "Unable to write model ID", index);
      return;
    }
    idFile << id;
    idFile.close();
    // I wanna give up on this thing so bad...
    std::ifstream is("./conf/model.conf");
    emscripten_console_logf("%d", is.good());
    emscripten_console_logf("%d", is.bad());
    emscripten_console_logf("%d", is.eof());
    emscripten_console_logf("%d", is.fail());
    is.close();
    //load(false);
  });
}
bool genericModel::extractModel() {
  static std::string path{};
  archive* src {archive_read_new()};
  archive* dst{archive_write_disk_new()};
  static archive_entry* entry{};
  archive_read_support_format_tar(src);
  archive_read_open_filename(src, "/opfs/m0dEl.tar", 10240);
  archive_write_disk_set_standard_lookup(dst); 
  archive_write_disk_set_options(dst, ARCHIVE_EXTRACT_NO_AUTODIR | ARCHIVE_EXTRACT_UNLINK);
  if(archive_errno(src) != 0) return false;
  if(archive_errno(dst) != 0) return false;
  while(archive_read_next_header2(src, entry) == ARCHIVE_OK) {
    path = archive_entry_pathname(entry);
    path = "." + path.substr(path.find("/")); // Strip 1st component
    emscripten_console_log(archive_entry_pathname(entry));
    archive_read_extract2(src, entry, dst);
    if(archive_errno(src) != 0) return false;
    if(archive_errno(dst) != 0) return false;
  }
  archive_read_free(src);
  archive_write_free(dst);
  return true;
}