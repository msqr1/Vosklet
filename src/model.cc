#include "model.h"

model::model(const std::string& storepath, const std::string& id, int index) : genericModel(storepath, id, index) {}
model::~model() {
  vosk_model_free(mdl);
}
void model::afterFetch(int addr, size_t size) {
  genericModel::afterFetch(addr,size);
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
  // FIXME: Recognizer reuse this thread if possible
  std::thread t{main};
  t.detach();
}
bool model::checkModelFiles() { 
  static std::error_code c{};
  return fs::exists("am/final.mdl", c) &&
    fs::exists("conf/mfcc.conf", c) &&
    fs::exists("conf/model.conf", c) &&
    fs::exists("graph/phones/word_boundary.int", c) &&
    fs::exists("graph/Gr.fst", c) &&
    fs::exists("graph/HCLr.fst", c) &&
    fs::exists("graph/disambig_tid.int", c) &&
    fs::exists("ivector/final.dubm", c) &&
    fs::exists("ivector/final.ie", c) &&
    fs::exists("ivector/final.mat", c) &&
    fs::exists("ivector/global_cmvn.stats", c) && 
    fs::exists("ivector/online_cmvn.conf", c) &&
    fs::exists("ivector/splice.conf", c);
}