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
      fireEv("_continue", "Unable to extract model and delete .tzst file", index);
      return;
    }
    std::ofstream idFile("id");
    if(!idFile.is_open()) {
      fs::current_path("/opfs");
      fs::remove_all(storepath);
      fireEv("_continue", "Unable to write model ID", index);
      return;
    }
    idFile << id;
    idFile.close();
    char a[3] {};
    int fd = open("./conf/model.conf", O_RDONLY);
    read(fd, a, 3);
    emscripten_console_log(a);
    close(fd);
    std::ifstream is("./conf/model.conf");
    emscripten_console_logf("%d", is.good());
    emscripten_console_logf("%d", is.bad());
    emscripten_console_logf("%d", is.eof());
    emscripten_console_logf("%d", is.fail());

    //load(false);
  });
}
bool genericModel::extractModel() {
  std::string path{};
  archive* src {archive_read_new()};
  archive_entry* entry {};
  archive_read_support_filter_all(src);
  archive_read_support_format_all(src);
  archive_read_open_filename(src, "/opfs/m0dEl.tzst", 10240);
  if(archive_errno(src) != 0) return false;
  while (archive_read_next_header(src, &entry) == ARCHIVE_OK) {
    path = archive_entry_pathname(entry);
    // Strip first component, keep relative path
    path = "." + path.substr(path.find("/"));
    archive_entry_set_pathname(entry, path.c_str());
    if(archive_errno(src) != 0) return false;
    archive_read_extract(src, entry, ARCHIVE_EXTRACT_UNLINK);
  }
  archive_read_free(src);
  return fs::remove("/opfs/m0dEl.tzst",tank);
}