#include "spkModel.h"
SpkModel::SpkModel(const std::string &url, const std::string& storepath, const std::string& id, int index) : GenericModel(url, storepath, id, index) {
  if(!loadModel()) return;
  model = vosk_spk_model_new(this->storepath.c_str());
  if(model == nullptr) {
    fireEv("error", "Unable to initialize speaker model");
  }
  fireEv("ready");
};
bool SpkModel::checkModel(const std::string& path) {
  return fs::exists((path + "/mfcc.conf")) && 
    fs::exists((path + "/final.ext.raw")) && 
    fs::exists((path + "/mean.vec")) && 
    fs::exists((path + "/transform.mat"));
}