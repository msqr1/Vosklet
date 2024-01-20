#include "spkModel.h"
spkModel::spkModel(const std::string &url, const std::string& storepath, const std::string& id) : genericModel(url, storepath, id) {
  if(!loadModel(storepath)) return;
  mdl = vosk_spk_model_new(".");
  if(mdl == nullptr) {
    throwErr("Unable to initialize speaker model");
    return;
  }
};
spkModel::~spkModel() {
  vosk_spk_model_free(mdl);
}
bool spkModel::checkModel() {
  return fs::exists("mfcc.conf") && 
    fs::exists("final.ext.raw") && 
    fs::exists("mean.vec") && 
    fs::exists("transform.mat");
}