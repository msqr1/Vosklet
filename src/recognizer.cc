#include "recognizer.h" 

recognizer::recognizer(int index, float sampleRate, genericModel* model) : index{index}, rec{vosk_recognizer_new(std::get<0>(model->mdl),sampleRate)} {
  finishConstruction(model);
}
recognizer::recognizer(int index, float sampleRate, genericModel* model, genericModel* spkModel) : index(index), rec{vosk_recognizer_new_spk(std::get<0>(model->mdl), sampleRate, std::get<1>(spkModel->mdl))} {
  finishConstruction(model, spkModel);
}
recognizer::recognizer(int index, float sampleRate, genericModel* model, const std::string& grm, int dummy) : index{index}, rec{vosk_recognizer_new_grm(std::get<0>(model->mdl), sampleRate, grm.c_str())} {
  finishConstruction(model);
}
recognizer::~recognizer() {
  done.test_and_set(std::memory_order_relaxed);
  done.notify_one();
  vosk_recognizer_free(rec);
}
void recognizer::reset() {
  vosk_recognizer_reset(rec);
}
void recognizer::finishConstruction(genericModel* model, genericModel* spkModel) {
  if(rec == nullptr) {
    fireEv(index, "Unable to initialize recognizer");
    return;
  }
  auto main {[this](){
    emscripten_console_log("Recognizer loaded!");
    fireEv(index, &state, dataBuf);
    int sample{};
    char buffer[22480];
    ALCdevice* mic{alcCaptureOpenDevice("Emscripten OpenAL capture", sampleRate, AL_FORMAT_MONO16, 22480)};
    alcCaptureStart(mic);
    while(!done.test(std::memory_order_relaxed)) {
      alcGetIntegerv(mic, ALC_CAPTURE_SAMPLES, 4, &sample);
      alcCaptureSamples(mic, buffer, sample);
      switch(vosk_recognizer_accept_waveform(rec, buffer, 22480)) {
        case 0:
          fireEv(index, vosk_recognizer_result(rec), "result");
          break;
        case 1:
          fireEv(index, vosk_recognizer_partial_result(rec), "partialResult");
      }
    }
    alcCaptureCloseDevice(mic);
  }};
  if(!model->thrdConsumed) {
    model->thrdConsumed = true;
    model->func = main;
    model->blocker.unlock();
    emscripten_console_log("Using model's thread");
    return;
  }
  if(spkModel != nullptr && !spkModel->thrdConsumed) {
    spkModel->thrdConsumed = true;
    spkModel->func = main;
    spkModel->blocker.unlock();
    emscripten_console_log("Using speaker model's thread");
    return;
  }
  emscripten_console_log("New recognizer thread");
  std::thread t{main};
  t.detach();
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