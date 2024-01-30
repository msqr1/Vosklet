#include "recognizer.h" 
recognizer::recognizer(model* mdl, float sampleRate, int index) : index(index) {
  std::thread t{[this](VoskModel* mdl, VoskRecognizer* rec, float sampleRate){
    rec = vosk_recognizer_new(mdl,sampleRate);
    if(rec == nullptr) {
      fireEv("_continue", "Unable to initialize recognizer", this->index);
      return;
    }
    while(!done.test()) {
      fireEv("_continue", "." ,this->index);
      controller1.wait(false, std::memory_order_relaxed);
      controller2.wait(false, std::memory_order_relaxed);
      if(!done.test()) {
        switch(vosk_recognizer_accept_waveform_f(rec, dataPtr, 512)) {
        case 0:
        fireEv("result", vosk_recognizer_result(rec), this->index);
        break;
        case 1:
        fireEv("partialResult", vosk_recognizer_partial_result(rec), this->index);
        }
      }
    }
  },mdl->mdl, rec, sampleRate};
  t.detach();
}
recognizer::~recognizer() {
  done.test_and_set(std::memory_order_relaxed);
  controller1.notify_one();
  vosk_recognizer_free(rec);
  free(dataPtr);
}

void recognizer::acceptWaveForm() {
  controller1.test_and_set(std::memory_order_relaxed);
  controller1.notify_one();
  controller1.clear(std::memory_order_relaxed);
  controller1.notify_one(); //Make sure c1 is locked before unlocking c2
  controller2.test_and_set(std::memory_order_relaxed);
  controller2.notify_one();
  controller2.clear(std::memory_order_relaxed);
  controller2.notify_one();
  emscripten_console_log("Unblocked");
  fireEv("result", "Test event", index);
}
void recognizer::setGrm(const std::string& grm) {
  vosk_recognizer_set_grm(rec, grm.c_str());
}
void recognizer::setSpkModel(spkModel* mdl) {
  vosk_recognizer_set_spk_model(rec, mdl->mdl);
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