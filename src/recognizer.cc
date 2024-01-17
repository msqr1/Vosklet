#include "./recognizer.h" 
void recognizer::start() {
  controller.test_and_set(std::memory_order_relaxed);
  controller.notify_all();
}
void recognizer::stop() {
  controller.clear(std::memory_order_relaxed);
  controller.notify_all();
}
void recognizer::deinit() {
  done.test_and_set(std::memory_order_relaxed);
  done.notify_all();
  stop();
}
recognizer::recognizer(model* mdl, int sampleRate, int index) : genericObj(index) {
  mic = alcCaptureOpenDevice("Emscripten OpenAL capture",sampleRate, AL_FORMAT_MONO16, 22480);
  if(alcGetError(mic) != 0) {
    fireEv("error", "Unable to initialize microphone");
    return;
  }
  rec = vosk_recognizer_new(mdl->mdl,static_cast<float>(sampleRate));
  if(rec == nullptr) {
    fireEv("error", "Unable to construct recognizer");
    return;
  } 
  main();
}
void recognizer::main() {
  char buffer[22480];
  int sample{};
  fireEv("ready");
  while(!done.test()) {
    controller.wait(done.test(std::memory_order_relaxed), std::memory_order_relaxed);
    alcCaptureStart(mic);
    while(controller.test()) {
      alcGetIntegerv(mic, ALC_CAPTURE_SAMPLES, sizeof(int), &sample);
      alcCaptureSamples(mic, buffer, sample);
      switch(vosk_recognizer_accept_waveform(rec, buffer, 22480)) {
        case 0: 
          fireEv("result", vosk_recognizer_result(rec));
          break;
        case 1: 
          fireEv("partialResult", vosk_recognizer_partial_result(rec));
          break;
        default:
          fireEv("error", "Recognition result error");
      }
    }
    alcCaptureStop(mic);
  }
  vosk_recognizer_free(rec);
  alcCaptureCloseDevice(mic);
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