#include "model.h"

model::model(const std::string& storepath, const std::string& id) : genericModel(storepath, id) {}
model::~model() {
  vosk_model_free(mdl);
}
bool model::checkModelId() {
  return genericModel::checkModelId();
}
bool model::afterFetch(int addr, size_t size) {
  return genericModel::afterFetch(addr,size);
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