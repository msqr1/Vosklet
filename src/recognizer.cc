#include "recognizer.h" 
recognizer::recognizer(model* mdl, float sampleRate, int index) : index(index) {
  rec = vosk_recognizer_new(mdl->mdl,sampleRate);
  if(rec == nullptr) {
    throwJS("Unable to initialize recognizer");
  } 
}
recognizer::~recognizer() {
  vosk_recognizer_free(rec);
}
void recognizer::fireEv(const char *type, const char *content) {
  EM_ASM({
    recognizers[$0].dispatchEvent(new CustomEvent(UTF8ToString($1), {"details" : UTF8ToString($2)}));
  },this->index, type, content);
}
void recognizer::acceptWaveForm(float* data, int len) {
  switch(vosk_recognizer_accept_waveform_f(rec, data, len)) {
    case 0:
    fireEv("result", vosk_recognizer_result(rec));
    break;
    case 1:
    fireEv("partialResult", vosk_recognizer_partial_result(rec));
    break;
    default:
    throwJS("acceptWaveForm error (from C++)", true);
  }
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