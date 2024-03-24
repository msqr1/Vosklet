#include "genericModel.h"

genericModel::genericModel(int index, bool normalMdl, std::string storepath, std::string id) : index(index), normalMdl(normalMdl), storepath(std::move(storepath)), id(std::move(id)), entry(archive_entry_new()) {}
void genericModel::extractAndLoad(int tarStart, int tarSize) {
  static fs::path path{};
  static int fd{};
  thrd.addTask([this, tarStart, tarSize](){
    emscripten_console_log("Untaring...");
    archive* src {archive_read_new()};
    archive_read_support_format_tar(src);
    archive_read_open_memory(src, reinterpret_cast<void*>(tarStart), tarSize);
    if(archive_errno(src) != 0) {
      emscripten_console_logf("Unable to open tar in WASM memory: %s", archive_error_string(src));
      free(reinterpret_cast<void*>(tarStart));
      fireEv(index, "Unable to open tar in WASM memory");
      return;
    }
    while(1) {
      int headerRes {archive_read_next_header2(src, entry)};
      if(headerRes == ARCHIVE_EOF) break;
      if(headerRes < ARCHIVE_OK) {
        fireEv(index, archive_error_string(src));
        break;
      }
      path = archive_entry_pathname(entry);
      path = storepath + path.generic_string().substr(path.generic_string().find("/"));
      emscripten_console_logf("Creating file or directory %s", path.c_str()); 
      if(!path.has_extension()) {
        fs::create_directory(path);
        continue;
      }
      fd = creat(path.c_str(),0777);
      if(fd == -1) {
        emscripten_console_log("Unable to create model files");
        fireEv(index, "Unable to create model files");
        return;
      }
      archive_read_data_into_fd(src, fd);
      close(fd);
      if(archive_errno(src) != 0) {
        emscripten_console_logf("Cannot write into model files: %s", archive_error_string(src));
        fireEv(index, "Cannot write into model files");
        return;
      }
    }
    free(reinterpret_cast<void*>(tarStart));
    fs::remove(storepath + "/README");
    archive_read_free(src);
    if(normalMdl) mdl = vosk_model_new(storepath.c_str());
    else vosk_spk_model_new(storepath.c_str());
    emscripten_console_log("Loading finished!");
    if(normalMdl ? std::get<0>(mdl) == nullptr : std::get<1>(mdl) == nullptr) fireEv(index, "Unable to load model for recognition");
    else fireEv(index, "0");
  });
}
genericModel::~genericModel() {
  archive_entry_free(entry);
  if(normalMdl) vosk_model_free(std::get<0>(mdl));
  else vosk_spk_model_free(std::get<1>(mdl));
}