#include "CommonModel.h"

CommonModel::CommonModel(int index, bool normalMdl, std::string storepath, std::string id, int tarStart, int tarSize) :
  normalMdl{normalMdl}, index{index},
  storepath{std::move(storepath)},
  id{std::move(id)}
{
  globalPool.exec([this, tarStart, tarSize]{
    extractAndLoad(reinterpret_cast<unsigned char*>(tarStart), tarSize);
  });
}
void CommonModel::extractAndLoad(unsigned char* tar, int tarSize) {
  int res{untar(tar, tarSize, storepath)};
  free(tar);
  switch(res) {
  case IncorrectFormat:
    fireEv(index, "Untar: Incorrect tar format, must be USTAR");
    return;
  case IncorrectFiletype:
    fireEv(index, "Untar: Not a directory or regular file");
    return;
  case FailedOpen:
    fireEv(index, "Untar: Unable to open file for write");
    return;
  case FailedWrite:
    fireEv(index, "Untar: Unable to write file");
    return;
  case FailedClose:
    fireEv(index, "Untar: Unable to close file after write");
    return;
  };
  if(normalMdl) mdl = vosk_model_new(storepath.c_str());
  else mdl = vosk_spk_model_new(storepath.c_str());
  if(normalMdl ? std::get<VoskModel*>(mdl) != nullptr : std::get<VoskSpkModel*>(mdl) != nullptr) fireEv(index, "0");
  else fireEv(index, "Unable to load model for recognition");
  fs::remove_all(storepath);
}
int CommonModel::findWord(std::string word) {
  return vosk_model_find_word(std::get<VoskModel*>(mdl), word.c_str());
}
CommonModel::~CommonModel() {
  if(normalMdl) vosk_model_free(std::get<VoskModel*>(mdl));
  else vosk_spk_model_free(std::get<VoskSpkModel*>(mdl));
}