#include "./recognizer.h" 
void Recognizer::start() {
  controller.test_and_set(std::memory_order_relaxed);
  controller.notify_all();
}
void Recognizer::stop() {
  controller.clear(std::memory_order_relaxed);
  controller.notify_all();
}
void Recognizer::deinit() {
  done.test_and_set(std::memory_order_relaxed);
  done.notify_all();
  stop();
}
Recognizer::Recognizer(Model* model, int sampleRate, int index) : GenericObj(index) {
  mic = alcCaptureOpenDevice("Emscripten OpenAL capture",sampleRate, AL_FORMAT_MONO16, 22480);
  if(alcGetError(mic) != 0) {
    fireEv("error", "Unable to initialize microphone");
    return;
  }
  std::thread t{[this](Model* model, int sampleRate) {
    recognizer = vosk_recognizer_new(model->model,static_cast<float>(sampleRate));
    if(recognizer == nullptr) {
      fireEv("error", "Unable to construct recognizer");
      return;
    } 
    main();
  }, model, sampleRate};
  t.detach();
}
void Recognizer::main() {
  char buffer[22480];
  int sample{};
  fireEv("ready");
  while(!done.test()) {
    controller.wait(done.test(std::memory_order_relaxed), std::memory_order_relaxed);
    alcCaptureStart(mic);
    while(controller.test()) {
      alcGetIntegerv(mic, ALC_CAPTURE_SAMPLES, sizeof(int), &sample);
      alcCaptureSamples(mic, buffer, sample);
      switch(vosk_recognizer_accept_waveform(recognizer, buffer, 22480)) {
        case 0: 
          fireEv("result", vosk_recognizer_result(recognizer));
          break;
        case 1: 
          fireEv("partialResult", vosk_recognizer_partial_result(recognizer));
          break;
        default:
          fireEv("error", "Recognition result error");
      }
    }
    alcCaptureStop(mic);
  }
  vosk_recognizer_free(recognizer);
  alcCaptureCloseDevice(mic);
}
void Recognizer::setGrm(const std::string& grm) {
  vosk_recognizer_set_grm(recognizer, grm.c_str());
}
void Recognizer::setSpkModel(SpkModel* model) {
  vosk_recognizer_set_spk_model(recognizer,model->model);
}
void Recognizer::setWords(bool words) {
  vosk_recognizer_set_words(recognizer,words);
}
void Recognizer::setPartialWords(bool partialWords) {
  vosk_recognizer_set_partial_words(recognizer, partialWords);
}
void Recognizer::setNLSML(bool nlsml) {
  vosk_recognizer_set_nlsml(recognizer, nlsml);
}
void Recognizer::setMaxAlternatives(int alts) {
  vosk_recognizer_set_max_alternatives(recognizer, alts);
}