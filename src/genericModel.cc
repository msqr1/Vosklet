#include "genericModel.h"

genericModel::genericModel(int index, bool normalMdl, std::string storepath, std::string id) : normalMdl{normalMdl}, index{index}, storepath{std::move(storepath)}, id{std::move(id)} {}
void genericModel::extractAndLoad(int tarStart, int tarSize) {
  func = [this, tar = reinterpret_cast<unsigned char*>(tarStart), tarSize]() {
    int res{untar(tar, tarSize, storepath)};
    free(tar);
    switch(res) {
    case 1:
      fireEv(index, "Untar: Incorrect tar format, must be USTAR");
      return;
    case 2:
      fireEv(index, "Untar: Not a directory or regular file");
      return;
    case 3:
      fireEv(index, "Untar: Unable to open file for write");
      return;
    case 4: 
      fireEv(index, "Untar: Unable to write file");
      return;
    case 5:
      fireEv(index, "Untar: Unable to close file after write");
      return;  
    };
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
int genericModel::findWord(std::string word) {
  return vosk_model_find_word(std::get<VoskModel*>(mdl), word.c_str());
}
genericModel::~genericModel() {
  if(normalMdl) vosk_model_free(std::get<VoskModel*>(mdl));
  else vosk_spk_model_free(std::get<VoskSpkModel*>(mdl));
}