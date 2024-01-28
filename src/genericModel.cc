#include "genericModel.h"
fetchData::fetchData(const std::string& storepath, bool* successful, std::atomic_flag* blocker, genericModel* self) : storepath(storepath), successful(successful), blocker(blocker), self(self) {};
genericModel::genericModel(const std::string &url, const std::string& storepath, const std::string &id) : url(url), id(id) {
  fs::current_path("/opfs");
  fs::create_directories(storepath);
  fs::current_path(storepath);
}
bool genericModel::checkId(const std::string& id) {
  std::ifstream file {"id", std::ifstream::binary}; 
  if(!file.is_open()) return false;
  long long size {file.seekg(0, std::ios::end).tellg()};
  std::string oldid(size, ' ');
  file.seekg(0);
  file.read(&oldid[0], size);
  return id.compare(oldid) == 0 ? true : false;
}
bool genericModel::loadModel(const std::string& storepath) {
  if(checkModel() && checkId(id)) return true;
  std::atomic_flag blocker{};
  bool successful{};
  fetchData data{storepath, &successful, &blocker, this};
  emscripten_async_wget2(url.c_str(), "A_fIlEnAmE_tHaT_dOeS_nOt_CoNfLiCt.tzst", "GET", nullptr, (void*)&data, [](unsigned handle, void* arg, const char* fname){
    fetchData* data = (fetchData*)arg;
    if(!extractModel()) {
      throwJS("Unable to extract model");
      return;
    }
    fs::remove(fname);
    if(!data->self->checkModel()) {
      throwJS("Model URL contains invalid model files");
      fs::current_path("/opfs");
      fs::remove_all(data->storepath);
      return;
    }
    std::ofstream idFile("id");
    if(!idFile.is_open()) {
      throwJS("Unable to write new id");
      fs::current_path("/opfs");
      fs::remove_all(data->storepath);
      return;
    }
    idFile << data->self->id;
    *data->successful = true;
    data->blocker->notify_one();
  }, [](unsigned handle, void* arg, int status) {
    throwJS("Unable to fetch model");
    ((fetchData*)arg)->blocker->notify_one();
  }, nullptr);
  blocker.wait(false, std::memory_order_relaxed);
  return successful;
}
bool genericModel::extractModel() {
  std::string path{};
  archive* src {archive_read_new()};
  archive_entry* entry {};
  archive_read_support_filter_all(src);
  archive_read_support_format_all(src);
  archive_read_open_filename(src, "A_fIlEnAmE_tHaT_dOeS_nOt_CoNfLiCt.tzst",10240);
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