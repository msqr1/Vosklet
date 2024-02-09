#include "spkModel.h"
spkModel::spkModel(const std::string& storepath, const std::string& id, int index) : genericModel(storepath, id, index) {
  mdl = vosk_spk_model_new(".");
  if(mdl == nullptr) {
    fireEv("_continue", "Unable to initialize speaker model", index);
  }
}
spkModel::~spkModel() {
  vosk_spk_model_free(mdl);
}
void spkModel::checkModel() {
  genericModel::checkModel();
}
void spkModel::afterFetch() {
  genericModel::afterFetch();
}
void spkModel::load(bool newTask) {
  auto main{[this](){
    mdl = vosk_spk_model_new(".");
    if(mdl == nullptr) {
      fireEv("_continue", "Unable to load model for recognition", index);
      return;
    }
    fireEv("_continue", nullptr, index);
  }};
  if(!newTask) {
    main();
    return;
  }
  thrd.addTask(main);
}
bool spkModel::checkModelFiles() {
  return fs::exists("mfcc.conf", tank) && 
    fs::exists("final.ext.raw", tank) && 
    fs::exists("mean.vec", tank) && 
    fs::exists("transform.mat", tank);
}