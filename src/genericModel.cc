#include "genericModel.h"

genericModel::genericModel(std::string storepath, std::string id, int index, bool normalMdl) : index(index), normalMdl(normalMdl) {
  this->storepath = new char[storepath.size()];
  this->id = new char[id.size()];
  strcpy(this->storepath, storepath.c_str());
  strcpy(this->id, id.c_str());
}
void genericModel::load(bool newTask) {
  auto main{[this](){
    if(normalMdl) {
      VoskModel* temp {vosk_model_new(".")};
      if(temp == nullptr) {
        fireEv("_continue", "Unable to load model for recognition", index);
        return;
      }
      mdl = temp;
    }
    else {
      VoskSpkModel* temp {vosk_spk_model_new(".")};
      if(temp == nullptr) {
        fireEv("_continue", "Unable to load model for recognition", index);
        return;
      }
      mdl = temp;
    }
    fireEv("_continue", nullptr, index);
  }};
  if(!newTask) {
    main();
    return;
  }
  thrd.addTask(main);
}
bool genericModel::checkFiles() {
  if(std::holds_alternative<VoskModel*>(mdl)) {
    return fs::exists("am/final.mdl", tank) &&
      fs::exists("conf/mfcc.conf", tank) &&
      fs::exists("conf/model.conf", tank) &&
      fs::exists("graph/phones/word_boundary.int", tank) &&
      fs::exists("graph/Gr.fst", tank) &&
      fs::exists("graph/HCLr.fst", tank) &&
      fs::exists("graph/disambig_tid.int", tank) &&
      fs::exists("ivector/final.dubm", tank) &&
      fs::exists("ivector/final.ie", tank) &&
      fs::exists("ivector/final.mat", tank) &&
      fs::exists("ivector/global_cmvn.stats", tank) && 
      fs::exists("ivector/online_cmvn.conf", tank) &&
      fs::exists("ivector/splice.conf", tank);
  }
  return fs::exists("mfcc.conf", tank) && 
    fs::exists("final.ext.raw", tank) && 
    fs::exists("mean.vec", tank) && 
    fs::exists("transform.mat", tank);
}
genericModel::~genericModel() {
  if(std::holds_alternative<VoskModel*>(mdl)) {
    vosk_model_free(std::get<0>(mdl));
    return;
  }
  vosk_spk_model_free(std::get<1>(mdl));
  delete[] storepath;
  delete[] id;
}
void genericModel::check() {
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
    if(!checkFiles() && !fs::exists("id", tank)) {
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
    if(strcmp(oldid, id) != 0) fireEv("_checkMdl", "fetch", index);
    else fireEv("_checkMdl", nullptr, index);
    delete[] oldid;
  });
}
void genericModel::afterFetch() {
  thrd.addTask([this](){
    if(!extract()) {
      fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      fireEv("_continue", "Unable to extract model", index);
      return;
    }
    fs::remove("/opfs/m0dEl.tar",tank);
    fs::remove("README",tank);
    if(!checkFiles()) {
      fireEv("_continue", "URL points to invalid model files", index);
      return;
    }
    int idFd {open("id", O_WRONLY | O_TRUNC | O_CREAT)};
    if(idFd == -1) {
      fireEv("_continue", "Unable create ID file", index);
      fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      return;
    }
    if(write(idFd, id, strlen(id)) == -1) {
      fireEv("_continue", "Unable to write new ID", index);
      fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      close(idFd);
      return;
    };
    close(idFd);
    load(false);
  });
}
bool genericModel::extract() {
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