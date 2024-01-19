#include "model.h"

model::model(const std::string &url, const std::string& storepath, const std::string& id, int index) : genericModel(url, id, storepath, index) {
  if(!loadModel(storepath)) return;
  mdl = vosk_model_new(".");
  if(mdl == nullptr) {
    fireEv("error", "Unable to initialize model");
    return;
  }
  fireEv("ready");
};
model::~model() {
  vosk_model_free(mdl);
}
bool model::checkModel() { 
  return fs::exists("am/final.mdl") &&
    fs::exists("conf/mfcc.conf") &&
    fs::exists("conf/model.conf") &&
    fs::exists("graph/phones/word_boundary.int") &&
    fs::exists("graph/Gr.fst") &&
    fs::exists("graph/HCLr.fst") &&
    fs::exists("graph/disambig_tid.int") &&
    fs::exists("ivector/final.dubm") &&
    fs::exists("ivector/final.ie") &&
    fs::exists("ivector/final.mat") &&
    fs::exists("ivector/global_cmvn.stats") && 
    fs::exists("ivector/online_cmvn.conf") &&
    fs::exists("ivector/splice.conf");
}