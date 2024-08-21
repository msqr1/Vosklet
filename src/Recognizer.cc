#include "Recognizer.h" 

Recognizer::Recognizer(int index, float sampleRate, CommonModel* model) : 
  index{index}, 
  t{std::move(model->t)},
  rec{vosk_recognizer_new(std::get<VoskModel*>(model->mdl), sampleRate)} {
  finishConstruction(model);
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel* model, CommonModel* spkModel) : 
  index{index},
  t{std::move(model->t)},
  rec{vosk_recognizer_new_spk(std::get<VoskModel*>(model->mdl), sampleRate, std::get<VoskSpkModel*>(spkModel->mdl))} {
  finishConstruction(model, spkModel);
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel* model, const std::string& grm, int) : 
  index{index}, 
  t{std::move(model->t)},
  rec{vosk_recognizer_new_grm(std::get<VoskModel*>(model->mdl), sampleRate, grm.c_str())} {
  finishConstruction(model);
}
Recognizer::~Recognizer() {
  vosk_recognizer_free(rec);
  if(t.joinable()) {
    done = true;
    blocker.store(true, std::memory_order_relaxed);
    blocker.notify_one();
    t.join();
  }
}
void Recognizer::finishConstruction(CommonModel* model, CommonModel* spkModel) {
  if(rec == nullptr) {
    fireEv(index, "Unable to initialize recognizer");
    return;
  }
  if(!model->thrdUsed.load(std::memory_order_relaxed)) {
    model->recognizerMain = [this]{main();};
    model->thrdUsed.store(true, std::memory_order_relaxed);
    model->thrdUsed.notify_one();
    return;
  }
  if(spkModel != nullptr && !spkModel->thrdUsed.load(std::memory_order_relaxed)) {
    spkModel->recognizerMain = [this]{main();};
    spkModel->thrdUsed.store(true, std::memory_order_relaxed);
    spkModel->thrdUsed.notify_one();
    return;
  }
  t = std::thread{&Recognizer::main, this};
}
void Recognizer::main() {
  fireEv(index, "0");
  while(!done) {
    blocker.wait(false, std::memory_order_relaxed);  
    blocker.store(false, std::memory_order_relaxed);
    while(!dataQ.empty()) {
      AudioData& next = dataQ.front();
      // If done we free the rest of the data by skipping this block
      switch(vosk_recognizer_accept_waveform_f(rec, next.data, next.len)) {
      case 0: [[likely]]
        fireEv(index, vosk_recognizer_partial_result(rec), "partialResult");
        break;
      case 1: [[unlikely]]
        fireEv(index, vosk_recognizer_result(rec), "result");
      }
      free(next.data);
      dataQ.pop();
    }
  }
}
void Recognizer::pushData(int start, int len) {
  dataQ.emplace(start, len);
  blocker.store(true, std::memory_order_relaxed);
  blocker.notify_one();
}
void Recognizer::reset() {
  vosk_recognizer_reset(rec);
}
void Recognizer::setEndpointerMode(VoskEndpointerMode mode) {
  vosk_recognizer_set_endpointer_mode(rec, mode);
}
void Recognizer::setEndpointerDelays(float tStartMax, float tEnd, float tMax) {
  vosk_recognizer_set_endpointer_delays(rec, tStartMax, tEnd, tMax);
}
void Recognizer::setGrm(const std::string& grm) {
  vosk_recognizer_set_grm(rec, grm.c_str());
}
void Recognizer::setSpkModel(CommonModel* spkModel) {
  vosk_recognizer_set_spk_model(rec, std::get<VoskSpkModel*>(spkModel->mdl));
}
void Recognizer::setWords(bool words) {
  vosk_recognizer_set_words(rec, words);
}
void Recognizer::setPartialWords(bool partialWords) {
  vosk_recognizer_set_partial_words(rec, partialWords);
}
void Recognizer::setNLSML(bool nlsml) {
  vosk_recognizer_set_nlsml(rec, nlsml);
}
void Recognizer::setMaxAlternatives(int alts) {
  vosk_recognizer_set_max_alternatives(rec, alts);
}