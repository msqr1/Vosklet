#include "CommonModel.h"

CommonModel::CommonModel(int index, bool normalMdl, int tarStart, int tarSize) : normalMdl{normalMdl}, index{index}
{
  extractAndLoad(reinterpret_cast<unsigned char *>(tarStart), tarSize);
}
void CommonModel::extractAndLoad(unsigned char *tar, int tarSize)
{
  // Map index onto [A-Z]
  const char storepath[3]{'/', static_cast<char>(index % 26 + 'A')};
  int res{untar(tar, tarSize, storepath)};
  free(tar);
  const char *untarErr{};
  switch (res)
  {
  case IncorrectFormat:
    untarErr = "Untar: Incorrect tar format, must be USTAR";
    break;
  case IncorrectFiletype:
    untarErr = "Untar: Not a directory or regular file";
    break;
  case FailedOpen:
    untarErr = "Untar: Unable to open file for write";
    break;
  case FailedWrite:
    untarErr = "Untar: Unable to write file";
    break;
  case FailedClose:
    untarErr = "Untar: Unable to close file after write";
  };
  if (untarErr != nullptr)
  {
    fireEv(index, untarErr);
    return;
  }
  if (normalMdl)
    mdl = vosk_model_new(storepath);
  else
    mdl = vosk_spk_model_new(storepath);
  if (normalMdl ? std::get<VoskModel *>(mdl) != nullptr : std::get<VoskSpkModel *>(mdl) != nullptr)
    fireEv(index);
  else
    fireEv(index, "Unable to load model for recognition");
  fs::remove_all(storepath);
}
int CommonModel::findWord(std::string word)
{
  return vosk_model_find_word(std::get<VoskModel *>(mdl), word.c_str());
}
CommonModel::~CommonModel()
{
  if (normalMdl)
    vosk_model_free(std::get<VoskModel *>(mdl));
  else
    vosk_spk_model_free(std::get<VoskSpkModel *>(mdl));
}