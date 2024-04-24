#include "genericModel.h"

genericModel::genericModel(int index, bool normalMdl, std::string storepath, std::string id) : index{index}, normalMdl{normalMdl}, storepath{std::move(storepath)}, id{std::move(id)}, entry{archive_entry_new()} {}
void genericModel::extractAndLoad(int tarStart, int tarSize) {
  static fs::path path{};
  static int fd{};
  void* tar{reinterpret_cast<void*>(tarStart)};
  func = [this, tar, tarSize](){
    archive* src {archive_read_new()};
    archive_read_support_format_tar(src);
    archive_read_open_memory(src, tar, tarSize);
    if(archive_errno(src) != 0) {
      free(tar);
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
      path = storepath + path.string().substr(path.string().find("/")); 
      if(!path.has_extension()) {
        fs::create_directory(path);
        continue;
      }
      fd = creat(path.c_str(),0777);
      if(fd == -1) {
        fireEv(index, "Unable to create model files");
        return;
      }
      archive_read_data_into_fd(src, fd);
      close(fd);
      if(archive_errno(src) != 0) {
        fireEv(index, "Cannot write into model files");
        return;
      }
    }
    free(tar);
    archive_read_free(src);
    if(normalMdl) mdl = vosk_model_new(storepath.c_str());
    else mdl = vosk_spk_model_new(storepath.c_str());
    if(normalMdl ? std::get<VoskModel*>(mdl) != nullptr : std::get<VoskSpkModel*>(mdl) != nullptr) fireEv(index, "0");
    else fireEv(index, "Unable to load model for recognition");
    fs::remove_all(storepath);
  };
  std::thread t{[this](){
    func();
    blocker.wait(false, std::memory_order_relaxed);
    func();
  }};
  t.detach();
}
genericModel::~genericModel() {
  archive_entry_free(entry);
  if(normalMdl) vosk_model_free(std::get<VoskModel*>(mdl));
  else vosk_spk_model_free(std::get<VoskSpkModel*>(mdl));
}