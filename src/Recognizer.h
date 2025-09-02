#pragma once
#include "CommonModel.h"
#include <queue>

// Prevent naming conflicts with Vosk's Recognizer class
#define Recognizer Recognizer_
struct Recognizer
{
  int index;
  VoskRecognizer *rec;
  Recognizer(int index, float sampleRate, CommonModel *model);
  Recognizer(int index, float sampleRate, CommonModel *model, CommonModel *spkModel);
  Recognizer(int index, float sampleRate, CommonModel *model, const std::string &grm, int);
  const char *acceptWaveform(int start, int len);
  void reset();
  void setEndpointerMode(VoskEndpointerMode mode);
  void setEndpointerDelays(float tStartMax, float tEnd, float tMax);
  void setSpkModel(CommonModel *model);
  void setGrm(const std::string &grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};