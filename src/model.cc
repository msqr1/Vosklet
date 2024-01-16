#include "model.h"

Model::Model(const std::string &url, const std::string& storepath, const std::string& id, int index) : GenericModel(url, storepath, id, index) {
  if(!loadModel()) return;
  model = vosk_model_new(this->storepath.c_str());
  if(model == nullptr) {
    fireEv("error", "Unable to initialize model");
    return;
  }
  fireEv("ready");
};

bool Model::checkModel(const std::string& path) { 
  return fs::exists(path + "/am/final.mdl") &&
    fs::exists(path + "/conf/mfcc.conf") &&
    fs::exists(path + "/conf/model.conf") &&
    fs::exists(path + "/graph/phones/word_boundary.int") &&
    fs::exists(path + "/graph/Gr.fst") &&
    fs::exists(path + "/graph/HCLr.fst") &&
    fs::exists(path + "/graph/disambig_tid.int") &&
    fs::exists(path + "/ivector/final.dubm") &&
    fs::exists(path + "/ivector/final.ie") &&
    fs::exists(path + "/ivector/final.mat") &&
    fs::exists(path + "/ivector/global_cmvn.stats") && 
    fs::exists(path + "/ivector/online_cmvn.conf") &&
    fs::exists(path + "/ivector/splice.conf");
}