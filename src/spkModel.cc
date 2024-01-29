#include "spkModel.h"
spkModel::spkModel(const std::string& storepath, const std::string& id) : genericModel(storepath, id) {
  mdl = vosk_spk_model_new(".");
  if(mdl == nullptr) {
    throwJS("Unable to initialize speaker model");
  }
}
spkModel::~spkModel() {
  vosk_spk_model_free(mdl);
}
bool spkModel::checkModelId() {
  return genericModel::checkModelId();
}
bool spkModel::afterFetch(int addr, size_t size) {
  return genericModel::afterFetch(addr,size);
}
bool spkModel::checkModelFiles() {
  return fs::exists("mfcc.conf") && 
    fs::exists("final.ext.raw") && 
    fs::exists("mean.vec") && 
    fs::exists("transform.mat");
}