#include "genericModel.h"

genericModel::genericModel(const std::string& storepath, const std::string &id, int index) : storepath(storepath), id(id), index(index) {}
void genericModel::checkModel() {
  thrd.addTask([this](){
    if(OPFSTried && !OPFSOk) {
      fireEv("_checkMdl", "OPFS isn't available", index);
      return;
    }
    if(!OPFSTried){
      OPFSTried = true;
      OPFSOk = wasmfs_create_directory("/opfs", 0777, wasmfs_create_opfs_backend()) == 0;
    }
    if(!OPFSOk) {
      fireEv("_checkMdl", "OPFS initialization failed", index);
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
    if(!checkModelFiles() && !fs::exists("id", tank)) {
      fireEv("_checkMdl", "fetch", index);
      return;
    }
    FILE* idFile {fopen("id", "r")};
    if(idFile == nullptr) {
      fireEv("_checkMdl", "Couldn't open id file", index);
      return;
    }
    if(fseek(idFile, 0, SEEK_END) != 0) {
      fireEv("_checkMdl", "Id file end seeking fail", index);
      fclose(idFile);
      return;
    };
    long long oldsize{ftell(idFile)};
    char* oldid {new char[oldsize]};
    if(fseek(idFile, 0L, SEEK_SET) != 0) {
      fireEv("_checkMdl", "Id file start seeking fail", index);
      fclose(idFile);
      return;
    };
    fread(oldid, 1, oldsize, idFile);
    fclose(idFile);
    if(strcmp(oldid, id.c_str()) != 0) fireEv("_checkMdl", "fetch", index);
    else fireEv("_checkMdl", nullptr, index);
    delete[] oldid;
  });
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
      fireEv("_continue", "URL points to invalid model files", index);
      return;
    }
    int idFd {open("id", O_WRONLY | O_TRUNC)};
    if(write(idFd, id.c_str(), id.size()) == -1) {
      fireEv("_continue", "Unable to write new ID", index);
      close(idFd);
      return;
    };
    close(idFd);
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
    if(archive_errno(src) != 0) return false;
  }
  archive_read_free(src);
  return true;
}