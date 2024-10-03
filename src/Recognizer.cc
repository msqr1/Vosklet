#include "Recognizer.h"
#include <atomic>

const char* recognizerInitErr{"Unable to initialize recognizer"};
Recognizer::Recognizer(int index, float sampleRate, CommonModel* model) :
  rec{vosk_recognizer_new(std::get<VoskModel*>(model->mdl), sampleRate)} {
  if(rec == nullptr) fireEv(index, Event::status, recognizerInitErr);
  else globalPool.exec([this, index]{main(index);});
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel* model, CommonModel* spkModel) :
  rec{vosk_recognizer_new_spk(std::get<VoskModel*>(model->mdl), sampleRate, std::get<VoskSpkModel*>(spkModel->mdl))} {
  if(rec == nullptr) fireEv(index, Event::status, recognizerInitErr);
  else globalPool.exec([this, index]{main(index);});
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel* model, const std::string& grm, int) :
  rec{vosk_recognizer_new_grm(std::get<VoskModel*>(model->mdl), sampleRate, grm.c_str())} {
  if(rec == nullptr) fireEv(index, Event::status, recognizerInitErr);
  else globalPool.exec([this, index]{main(index);});
}
void Recognizer::safeDelete(bool _processCurrent) {
  emscripten_atomic_store_u8(&processCurrent, _processCurrent);
  emscripten_atomic_store_u8(&done, true);
  emscripten_atomic_store_u32(&haveData, true);
  emscripten_atomic_notify(&haveData, 1);
}
void Recognizer::main(int index) {
  fireEv(index, Event::status);
  AudioData* next;
  while(!emscripten_atomic_load_u8(&done)) {
    if(dataQ.empty()) {
      emscripten_atomic_store_u32(&haveData, false);
      emscripten_atomic_wait_u32(&haveData, false, -1);
    }
    else {
      next = &dataQ.front();
      switch(vosk_recognizer_accept_waveform_f(rec, next->data, next->len)) {
        case 0:
          fireEv(index, Event::partialResult, vosk_recognizer_partial_result(rec));
          break;
        case 1:
          fireEv(index, Event::result, vosk_recognizer_result(rec));
      }
      free(next->data);
      dataQ.pop();
    }
  }
  if(emscripten_atomic_load_u8(&processCurrent)) {
    while(!dataQ.empty()) {
      free(dataQ.front().data);
      dataQ.pop();
    }
  }
  else {
    while(!dataQ.empty()) {
      next = &dataQ.front();
      switch(vosk_recognizer_accept_waveform_f(rec, next->data, next->len)) {
        case 0: [[likely]]
          fireEv(index, Event::partialResult, vosk_recognizer_partial_result(rec));
          break;
        case 1: [[unlikely]]
          fireEv(index, Event::result, vosk_recognizer_result(rec));
      }
      free(next->data);
      dataQ.pop();
    }
  }
  fireEv(index, Event::result, vosk_recognizer_final_result(rec));
  vosk_recognizer_free(rec);
  fireEv(index, Event::status);
}
void Recognizer::acceptWaveform(int start, int len) {
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