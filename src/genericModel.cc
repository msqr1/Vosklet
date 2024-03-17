#include "genericModel.h"

genericModel::genericModel(std::string storepath, std::string id, int index, bool normalMdl) : index(index), normalMdl(normalMdl), storepath("/opfs/" + std::move(storepath)), id(std::move(id)), entry(archive_entry_new()) {}
void genericModel::load() {
  thrd.addTask([this](){
    if(normalMdl) mdl = vosk_model_new(storepath.c_str());
    else vosk_spk_model_new(storepath.c_str());
    if(normalMdl && std::get<0>(mdl) == nullptr || std::get<1>(mdl) == nullptr) fireEv(index, "Unable to load model for recognition");
    else fireEv(index, nullptr);
  });
}
bool genericModel::checkFiles() {
  if(normalMdl) {
    return fs::exists(storepath + "/am/final.mdl", tank) &&
      fs::exists(storepath + "/conf/mfcc.conf", tank) &&
      fs::exists(storepath + "/conf/model.conf", tank) &&
      fs::exists(storepath + "/graph/phones/word_boundary.int", tank) &&
      fs::exists(storepath + "/graph/Gr.fst", tank) &&
      fs::exists(storepath + "/graph/HCLr.fst", tank) &&
      fs::exists(storepath + "/graph/disambig_tid.int", tank) &&
      fs::exists(storepath + "/ivector/final.dubm", tank) &&
      fs::exists(storepath + "/ivector/final.ie", tank) &&
      fs::exists(storepath + "/ivector/final.mat", tank) &&
      fs::exists(storepath + "/ivector/global_cmvn.stats", tank) && 
      fs::exists(storepath + "/ivector/online_cmvn.conf", tank) &&
      fs::exists(storepath + "/ivector/splice.conf", tank);
  }
  return fs::exists(storepath + "/mfcc.conf", tank) && 
  fs::exists(storepath + "/final.ext.raw", tank) && 
  fs::exists(storepath + "/mean.vec", tank) && 
  fs::exists(storepath + "/transform.mat", tank);
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
      fireEv(index, "OPFS isn't available");
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
      fireEv(index, "OPFS initialization failed");
      return;
    }
    if(!checkFiles() && !fs::exists(storepath + "/id", tank)) {
      emscripten_console_log("Model is not available, fetching...");
      fireEv(index, "1");
      return;
    }
    emscripten_console_log("Model is available, verifying ID");
    std::ifstream idFile(storepath + "/id");
    idFile.seekg(0, std::ios::end);
    size_t oldSize = idFile.tellg();
    std::string oldID(oldSize, ' ');
    idFile.seekg(0);
    idFile.read(&oldID[0], oldSize); 
    if(id.compare(oldID.c_str()) != 0) {
      emscripten_console_log("ID doesn't match, fetching...");
      fireEv(index, "1");
    }
    else {
      emscripten_console_log("ID matches, loading...");
      load();
    }
    emscripten_console_log("Success! Model is ready!");
  });
}
void genericModel::afterFetch() {
  thrd.addTask([this](){
    emscripten_console_log("Trying to extract...");
    if(!extract()) {
      fs::remove(storepath + ".tar",tank);
      fs::remove_all(storepath, tank);
      emscripten_console_log("Unable to extract model");
      fireEv(index, "Unable to extract model");
      return;
    }
    emscripten_console_log("Extract done, checking files...");
    if(!checkFiles()) {
      emscripten_console_log("URL points to invalid model files");
      fireEv(index, "URL points to invalid model files");
      return;
    }
    emscripten_console_log("Creating ID file...");
    int idFd {creat((storepath + "/id").c_str(),0777)};
    if(idFd == -1) {
      emscripten_console_log("Unable to create ID file");
      fireEv(index, "Unable to create ID file");
      fs::remove(storepath + ".tar",tank);
      fs::remove_all(storepath, tank);
      return;
    }
    emscripten_console_log("Writing ID...");
    if(write(idFd,id.data(), id.size()) == -1) {
      emscripten_console_log("Unable to write new ID");
      fireEv(index, "Unable to write new ID");
      fs::remove(storepath + ".tar",tank);
      fs::remove_all(storepath, tank);
      close(idFd);
      return;
    };
    close(idFd);
    emscripten_console_log("Success! Model is ready!");
  });
  load();
}
bool genericModel::extract() {
  static fs::path path{};
  static int fd{};
  archive* src {archive_read_new()};
  archive_read_support_format_tar(src);
  archive_read_open_filename(src, (storepath + ".tar").c_str(), 10240);
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
    path = storepath + path.generic_string().substr(path.generic_string().find("/"));
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
  fs::remove(storepath + "/README",tank);
  fs::remove(storepath + ".tar" ,tank);
  archive_read_free(src);
  return true;
}