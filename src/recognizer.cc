#include "recognizer.h" 

recognizer::recognizer(genericModel* model, float sampleRate, int index) : index(index) {
  emscripten_console_log("Recognizer constructor called...");
  rec = vosk_recognizer_new(std::get<0>(model->mdl),sampleRate);
  finishConstruction(model, nullptr);
}
recognizer::recognizer(genericModel* model, genericModel* spkMdl, float sampleRate, int index) : index(index) {
  emscripten_console_log("Recognizer constructor called...");
  rec = vosk_recognizer_new_spk(std::get<0>(model->mdl), sampleRate, std::get<1>(spkMdl->mdl));
  finishConstruction(model, spkMdl);
}
recognizer::recognizer(genericModel* model, const std::string& grm, float sampleRate, int index, int dummy) : index(index) {
  emscripten_console_log("Recognizer constructor called...");
  rec = vosk_recognizer_new_grm(std::get<0>(model->mdl), sampleRate, grm.c_str());
  finishConstruction(model, nullptr);
}
recognizer::~recognizer() {
  done.test_and_set(std::memory_order_relaxed);
  done.notify_one();
  controller.test_and_set(std::memory_order_relaxed);
  controller.notify_one();
  vosk_recognizer_free(rec);
  free(dataPtr);
}
void recognizer:: finishConstruction(genericModel* model, genericModel* spkModel) {
  if(rec == nullptr) {
    fireEv(index, "Unable to initialize recognizer");
    return;
  }
  auto main {[this](){
    emscripten_console_log("Recognizer loaded!");
    fireEv(index, "0");
    while(!done.test(std::memory_order_relaxed)) {
      controller.wait(!done.test(std::memory_order_relaxed), std::memory_order_relaxed);
      controller.clear(std::memory_order_relaxed);
      if(done.test(std::memory_order_relaxed)) continue;
      switch(vosk_recognizer_accept_waveform_f(rec, dataPtr, 512)) {
        case 0:
          fireEv(index, vosk_recognizer_result(rec), "result");
          break;
        case 1:
          fireEv(index, vosk_recognizer_partial_result(rec), "partialResult");
      }
  }
  }};
  if(!model->recognizerUsedThrd) {
    model->recognizerUsedThrd = true;
    model->thrd.addTask(main);
    emscripten_console_log("Adding task to model thread...");
    return;
  }
  if(spkModel != nullptr && !spkModel->recognizerUsedThrd) {
    spkModel->recognizerUsedThrd = true;
    spkModel->thrd.addTask(main);
    emscripten_console_log("Adding task to speaker model thread...");
    return;
  }
  emscripten_console_log("New recognizer thread");
  std::thread t{main};
  t.detach();
}
void recognizer::acceptWaveForm() {
  controller.test_and_set(std::memory_order_relaxed);
  controller.notify_one();
}
void recognizer::setGrm(const std::string& grm) {
  vosk_recognizer_set_grm(rec, grm.c_str());
}
void recognizer::setSpkModel(genericModel* spkModel) {
  vosk_recognizer_set_spk_model(rec, std::get<1>(spkModel->mdl));
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