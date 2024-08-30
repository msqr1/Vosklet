#include "Recognizer.h"

Recognizer::Recognizer(int index, float sampleRate, CommonModel* model) :
  index{index},
  rec{vosk_recognizer_new(std::get<VoskModel*>(model->mdl), sampleRate)}
{
  finishConstruction(model);
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel* model, CommonModel* spkModel) :
  index{index},
  rec{vosk_recognizer_new_spk(std::get<VoskModel*>(model->mdl), sampleRate, std::get<VoskSpkModel*>(spkModel->mdl))} {
  finishConstruction(model, spkModel);
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel* model, const std::string& grm, int) :
  index{index},
  rec{vosk_recognizer_new_grm(std::get<VoskModel*>(model->mdl), sampleRate, grm.c_str())} {
  finishConstruction(model);
}
Recognizer::~Recognizer() {
  done = true;
  emscripten_atomic_store_u32(&haveData, true);
  emscripten_atomic_notify(&haveData, 1);
  while(!dataQ.empty()) {
    free(dataQ.front().data);
    dataQ.pop();
  }
  vosk_recognizer_free(rec);
}
void Recognizer::finishConstruction(CommonModel* model, CommonModel* spkModel) {
  if(rec == nullptr) fireEv(index, "Unable to initialize recognizer");
  else globalPool.exec([this]{main();});
}
void Recognizer::main() {
  fireEv(index, "0");
  while(!done) {
    if(dataQ.empty()) {
      emscripten_atomic_store_u32(&haveData, false);
      emscripten_atomic_wait_u32(&haveData, false, -1);
    }
    else {
      AudioData& next = dataQ.front();
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
  emscripten_atomic_store_u32(&haveData, true);
  emscripten_atomic_notify(&haveData, 1);
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