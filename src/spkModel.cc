#include "spkModel.h"
spkModel::spkModel(const std::string &url, const std::string& storepath, const std::string& id, int index) : genericModel(url, storepath, id, index) {
  if(!loadModel(storepath)) return;
  mdl = vosk_spk_model_new(".");
  if(mdl == nullptr) {
    fireEv("error", "Unable to initialize speaker model");
  }
  fireEv("ready");
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