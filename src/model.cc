#include "model.h"

model::model(const std::string& storepath, const std::string& id, int index) : genericModel(storepath, id, index) {}
model::~model() {
  vosk_model_free(mdl);
}
void model::afterFetch() {
  genericModel::afterFetch();
}
bool model::checkModel() {
  return genericModel::checkModel();
}
void model::load(bool newThrd) {
  auto main{[this](){
    mdl = vosk_model_new(".");
    if(mdl == nullptr) {
      fireEv("_continue", "Unable to load model for recognition", index);
      return;
    }
    fireEv("_continue", ".", index);
  }};
  if(!newThrd) {
    main();
    return;
  }
  thrd.addTask(main);
}
bool model::checkModelFiles() { 
  return fs::exists("am/final.mdl", tank) &&
    fs::exists("conf/mfcc.conf", tank) &&
    fs::exists("conf/model.conf", tank) &&
    fs::exists("graph/phones/word_boundary.int", tank) &&
    fs::exists("graph/Gr.fst", tank) &&
    fs::exists("graph/HCLr.fst", tank) &&
    fs::exists("graph/disambig_tid.int", tank) &&
    fs::exists("ivector/final.dubm", tank) &&
    fs::exists("ivector/final.ie", tank) &&
    fs::exists("ivector/final.mat", tank) &&
    fs::exists("ivector/global_cmvn.stats", tank) && 
    fs::exists("ivector/online_cmvn.conf", tank) &&
    fs::exists("ivector/splice.conf", tank);
}