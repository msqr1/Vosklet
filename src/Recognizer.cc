#include "Recognizer.h"
#include <atomic>

const char *recognizerInitErr{"Unable to initialize recognizer"};
Recognizer::Recognizer(int index, float sampleRate, CommonModel *model) : rec{vosk_recognizer_new(std::get<VoskModel *>(model->mdl), sampleRate)}
{
  if (rec == nullptr)
  {
    fireEv(index, recognizerInitErr);
  }
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel *model, CommonModel *spkModel) : rec{vosk_recognizer_new_spk(std::get<VoskModel *>(model->mdl), sampleRate, std::get<VoskSpkModel *>(spkModel->mdl))}
{
  if (rec == nullptr)
  {
    fireEv(index, recognizerInitErr);
  }
}
Recognizer::Recognizer(int index, float sampleRate, CommonModel *model, const std::string &grm, int) : rec{vosk_recognizer_new_grm(std::get<VoskModel *>(model->mdl), sampleRate, grm.c_str())}
{
  if (rec == nullptr)
  {
    fireEv(index, recognizerInitErr);
  }
}

const char *Recognizer::acceptWaveform(int start, int len)
{
  switch (vosk_recognizer_accept_waveform_f(rec, reinterpret_cast<float *>(start), len))
  {
  case 0:
    return vosk_recognizer_partial_result(rec);
    break;
  case 1:
    return vosk_recognizer_result(rec);
  }
  return nullptr;
}
void Recognizer::reset()
{
  vosk_recognizer_reset(rec);
}
void Recognizer::setEndpointerMode(VoskEndpointerMode mode)
{
  vosk_recognizer_set_endpointer_mode(rec, mode);
}
void Recognizer::setEndpointerDelays(float tStartMax, float tEnd, float tMax)
{
  vosk_recognizer_set_endpointer_delays(rec, tStartMax, tEnd, tMax);
}
void Recognizer::setGrm(const std::string &grm)
{
  vosk_recognizer_set_grm(rec, grm.c_str());
}
void Recognizer::setSpkModel(CommonModel *spkModel)
{
  vosk_recognizer_set_spk_model(rec, std::get<VoskSpkModel *>(spkModel->mdl));
}
void Recognizer::setWords(bool words)
{
  vosk_recognizer_set_words(rec, words);
}
void Recognizer::setPartialWords(bool partialWords)
{
  vosk_recognizer_set_partial_words(rec, partialWords);
}
void Recognizer::setNLSML(bool nlsml)
{
  vosk_recognizer_set_nlsml(rec, nlsml);
}
void Recognizer::setMaxAlternatives(int alts)
{
  vosk_recognizer_set_max_alternatives(rec, alts);
}