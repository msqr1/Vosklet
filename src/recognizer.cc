#include "recognizer.h" 
recognizer::recognizer(model* mdl, float sampleRate, int index) : index(index) {
  fs::current_path("/opfs");
  fs::current_path(mdl->storepath);
  std::thread t{[this](VoskModel* mdl, VoskRecognizer* rec, float sampleRate){
    if(mdl == nullptr) {
      mdl = vosk_model_new(".");
      if(mdl == nullptr) {
        throwJS("Unable to load model");
        return;
      }
    }
    rec = vosk_recognizer_new(mdl,sampleRate);
    if(rec == nullptr) {
      throwJS("Unable to initialize recognizer");
      return;
    }
    while(!done.test()) {
      emscripten_console_log("In loop");
      controller.wait(false, std::memory_order_relaxed);
      if(!done.test()) {
        switch(vosk_recognizer_accept_waveform_f(rec, dataPtr, 512)) {
        case 0:
        fireEv("result", vosk_recognizer_result(rec));
        break;
        case 1:
        fireEv("partialResult", vosk_recognizer_partial_result(rec));
        }
      }
    }
  },mdl->mdl, rec, sampleRate};
  t.detach();
}
recognizer::~recognizer() {
  done.test_and_set(std::memory_order_relaxed);
  controller.notify_one();
  vosk_recognizer_free(rec);
  free(dataPtr);
}
void recognizer::fireEv(const char *type, const char *content) {
  static pthread_t targetThrd{pthread_self()};
  static ProxyingQueue pq{};
  pq.proxyAsync(targetThrd, [&](){
    EM_ASM({
      let ev = new CustomEvent(UTF8ToString($1), {"details" : UTF8ToString($2)});
      objs[$0].dispatchEvent(ev);
      console.log(objs[$0], ev)
    },index, type, content);
  });
}
void recognizer::acceptWaveForm() {
  controller.notify_one();
  emscripten_console_log("Unblocked");
  fireEv("result", "Test event");
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