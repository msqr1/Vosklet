#include "genericModel.h"

genericModel::genericModel(std::string storepath, std::string id, int index, bool normalMdl) : index(index), normalMdl(normalMdl), storepath(std::move(storepath)), id(std::move(id)), entry(archive_entry_new()) {}
void genericModel::load() {
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
  thrd.addTask(main);
}
bool genericModel::checkFiles() {
  if(normalMdl) {
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
  archive_entry_free(entry);
  if(normalMdl) vosk_model_free(std::get<0>(mdl));
  else vosk_spk_model_free(std::get<1>(mdl));
}
void genericModel::check() {
  thrd.addTask([this](){
    if(OPFSTried && !OPFSOk) {
      emscripten_console_log("OPFS isn't available");
      fireEv("_continue", "OPFS isn't available", index);
      return;
    }
    if(!OPFSTried){ 
      emscripten_console_log("Trying to acquire OPFS");
      OPFSTried = true;
      OPFSOk = wasmfs_create_directory("/opfs", 0777, wasmfs_create_opfs_backend()) == 0;
    };
    emscripten_console_log("Initializing OPFS");
    if(!OPFSOk) {
      emscripten_console_log("OPFS initialization failed");
      fireEv("_continue", "OPFS initialization failed", index);
      return;
    }
    fs::current_path("/opfs", tank);
    if(tank.value() != 0) {
      emscripten_console_log("Unable to cd OPFS root");
      fireEv("_continue","Unable to cd OPFS root", index);
      return;
    }
    fs::create_directories(storepath, tank);
    if(tank.value() != 0) {
      emscripten_console_log("Unable to create storepath");
      fireEv("_continue","Unable to create storepath", index);
    }
    fs::current_path(storepath, tank); 
    if(tank.value() != 0) {
      emscripten_console_log("Unable to cd storepath");
      fireEv("_continue", "Unable to cd storepath", index);
    }
    if(!checkFiles() && !fs::exists("id", tank)) {
      emscripten_console_log("Model is not available, fetching...");
      fireEv("_continue", "1", index);
      return;
    }
    emscripten_console_log("Model is available, verifying ID");
    std::ifstream idFile("id");
    idFile.seekg(0, std::ios::end);
    size_t oldSize = idFile.tellg();
    std::string oldID(oldSize, ' ');
    idFile.seekg(0);
    idFile.read(&oldID[0], oldSize); 
    if(id.compare(oldID.c_str()) != 0) {
      emscripten_console_log("ID doesn't match, fetching...");
      fireEv("_continue", "1", index);
    }
    else {
      emscripten_console_log("ID matches, loading...");
      //load();
    }
    emscripten_console_log("Success! Model is ready!");
  });
}
void genericModel::afterFetch() {
  thrd.addTask([this](){
    emscripten_console_log("Trying to extract...");
    if(!extract()) {
      //fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      //fs::remove_all(storepath, tank);
      emscripten_console_log("Unable to extract model");
      fireEv("_continue", "Unable to extract model", index);
      return;
    }
    emscripten_console_log("Extract done, checking files...");
    if(!checkFiles()) {
      emscripten_console_log("URL points to invalid model files");
      fireEv("_continue", "URL points to invalid model files", index);
      return;
    }
    emscripten_console_log("Creating ID file...");
    int idFd {creat("id",0777)};
    if(idFd == -1) {
      emscripten_console_log("Unable to create ID file");
      fireEv("_continue", "Unable to create ID file", index);
      fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      return;
    }
    emscripten_console_log("Writing ID...");
    if(write(idFd, id.c_str(), id.size()) == -1) {
      emscripten_console_log("Unable to write new ID");
      fireEv("_continue", "Unable to write new ID", index);
      fs::remove("/opfs/m0dEl.tar",tank);
      fs::current_path("/opfs", tank);
      fs::remove_all(storepath, tank);
      close(idFd);
      return;
    };
    close(idFd);
    emscripten_console_log("Success! Model is ready!");
  });
  //load();
}
bool genericModel::extract() {
  static fs::path path{};
  static int fd{};
  archive* src {archive_read_new()};
  archive_read_support_format_tar(src);
  archive_read_open_filename(src, "/opfs/m0dEl.tar", 10240);
  if(archive_errno(src) != 0) {
    emscripten_console_log(archive_error_string(src));
    return false;
  }
  while(archive_read_next_header2(src, entry) == ARCHIVE_OK) {
    if(archive_errno(src) != 0) {
      emscripten_console_log(archive_error_string(src));
      return false;
    }
    path = archive_entry_pathname(entry);
    // Strip 1st component, keep relative path
    path = "." + path.generic_string().substr(path.generic_string().find("/"));
    emscripten_console_logf("Creating file/dir %s", path.c_str()); 
    if(!path.has_extension()) {
      fs::create_directory(path);
      continue;
    }
    fd = creat(path.c_str(),0777);
    if(fd == -1) {
      return false;
    }
    archive_read_data_into_fd(src, fd);
    close(fd);
    if(archive_errno(src) != 0) {
      emscripten_console_log(archive_error_string(src));
      return false;
    }
  }
  fs::remove("README",tank);
  fs::remove("/opfs/m0dEl.tar",tank);
  archive_read_free(src);
  return true;
}