#include "recognizer.h" 

recognizer::recognizer(int index, float sampleRate, genericModel* model) : index{index}, rec{vosk_recognizer_new(std::get<VoskModel*>(model->mdl),sampleRate)} {
  fireEv(index, "0");
}
recognizer::recognizer(int index, float sampleRate, genericModel* model, genericModel* spkModel) : index{index}, rec{vosk_recognizer_new_spk(std::get<VoskModel*>(model->mdl), sampleRate, std::get<VoskSpkModel*>(spkModel->mdl))} {
  fireEv(index, "0");
}
recognizer::recognizer(int index, float sampleRate, genericModel* model, const std::string& grm, int dummy) : index{index}, rec{vosk_recognizer_new_grm(std::get<VoskModel*>(model->mdl), sampleRate, grm.c_str())} {
  fireEv(index, "0");
}
std::string recognizer::acceptWaveformS(int data, int len) {
  std::string res{};
  switch(vosk_recognizer_accept_waveform_f(rec, (float*)data, len)) {
  case 0:
    res = vosk_recognizer_result(rec);
    break;
  case 1:
    res = vosk_recognizer_partial_result(rec);
  }
  free((void*)data);
  return res;
}
recognizer::~recognizer() {
  vosk_recognizer_free(rec);
}
void recognizer::reset() {
  vosk_recognizer_reset(rec);
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
  vosk_recognizer_set_spk_model(rec, std::get<VoskSpkModel*>(spkModel->mdl));
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