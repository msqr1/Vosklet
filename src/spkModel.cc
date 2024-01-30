#include "spkModel.h"
spkModel::spkModel(const std::string& storepath, const std::string& id, int index) : genericModel(storepath, id, index) {
  mdl = vosk_spk_model_new(".");
  if(mdl == nullptr) {
    throwJS("Unable to initialize speaker model");
  }
}
spkModel::~spkModel() {
  vosk_spk_model_free(mdl);
}
void spkModel::checkModel() {
  genericModel::checkModel();
}
void spkModel::afterFetch(int addr, size_t size) {
  genericModel::afterFetch(addr,size);
}
bool spkModel::load() {
  mdl = vosk_spk_model_new(storepath.c_str());
  if(mdl == nullptr) return false;
  return true;
}
bool spkModel::checkModelFiles() {
  return fs::exists("mfcc.conf") && 
    fs::exists("final.ext.raw") && 
    fs::exists("mean.vec") && 
    fs::exists("transform.mat");
}