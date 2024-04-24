#include "recognizer.h" 

recognizer::recognizer(int index, float sampleRate, genericModel* model) : index{index}, rec{vosk_recognizer_new(std::get<VoskModel*>(model->mdl),sampleRate)} {
  finishConstruction(model);
}
recognizer::recognizer(int index, float sampleRate, genericModel* model, genericModel* spkModel) : index{index}, rec{vosk_recognizer_new_spk(std::get<VoskModel*>(model->mdl), sampleRate, std::get<VoskSpkModel*>(spkModel->mdl))} {
  finishConstruction(model, spkModel);
}
recognizer::recognizer(int index, float sampleRate, genericModel* model, const std::string& grm, int dummy) : index{index}, rec{vosk_recognizer_new_grm(std::get<VoskModel*>(model->mdl), sampleRate, grm.c_str())} {
  finishConstruction(model);
}
recognizer::~recognizer() {
  done = true;
  vosk_recognizer_free(rec);
}
void recognizer::finishConstruction(genericModel* model, genericModel* spkModel) {
  if(rec == nullptr) {
    fireEv(index, "Unable to initialize recognizer");
    return;
  }
  auto main {[this](){
    fireEv(index, "0");
    while(!done) {
      blocker.wait(done, std::memory_order_relaxed);
      blocker = false;
      while(!dataQ.empty()) {
        switch(vosk_recognizer_accept_waveform_f(rec, dataQ.front().data, dataQ.front().len)) {
        case 0:
          fireEv(index, vosk_recognizer_result(rec), "result");
          break;
        case 1:
          fireEv(index, vosk_recognizer_partial_result(rec), "partialResult");
        }
        free(dataQ.front().data);
        dataQ.pop();
      }
    }
  }};
  if(!model->resourceUsed) {
    model->resourceUsed = true;
    model->func = main;
    model->blocker = true;
    model->blocker.notify_one();
    return;
  }
  if(spkModel != nullptr && !spkModel->resourceUsed) {
    spkModel->resourceUsed = true;
    spkModel->func = main;
    spkModel->blocker = true;
    model->blocker.notify_one();
    return;
  }
  std::thread t{main};
  t.detach();
}
void recognizer::pushData(int start, int len) {
  dataQ.emplace(start, len);
  blocker = true;
  blocker.notify_one();
}
void recognizer::reset() {
  vosk_recognizer_reset(rec);
}
void recognizer::setEndpointerMode(VoskEndpointerMode mode) {
  vosk_recognizer_set_endpointer_mode(rec, mode);
}
void recognizer::setEndpointerDelays(float tStartMax, float tEnd, float tMax) {
  vosk_recognizer_set_endpointer_delays(rec, tStartMax, tEnd, tMax);
}
void recognizer::setGrm(const std::string& grm) {
  vosk_recognizer_set_grm(rec, grm.c_str());
}
void recognizer::setSpkModel(genericModel* spkModel) {
  vosk_recognizer_set_spk_model(rec, std::get<VoskSpkModel*>(spkModel->mdl));
}
void recognizer::setWords(bool words) {
  vosk_recognizer_set_words(rec,words);
}
void recognizer::setPartialWords(bool partialWords) {
  vosk_recognizer_set_partial_words(rec, partialWords);
}
void recognizer::setNLSML(bool nlsml) {
  vosk_recognizer_set_nlsml(rec, nlsml);
}
void recognizer::setMaxAlternatives(int alts) {
  vosk_recognizer_set_max_alternatives(rec, alts);
}