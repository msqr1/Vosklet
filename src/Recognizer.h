#pragma once
#include "CommonModel.h"

// Prevent naming conflicts with Vosk's Recognizer class
#define Recognizer Recognizer_
struct Recognizer {
  int haveData{}; 
  bool processCurrent{};
  bool done{};
  VoskRecognizer* rec;
  std::queue<AudioData> dataQ;
  Recognizer(int index, float sampleRate, CommonModel* model);
  Recognizer(int index, float sampleRate, CommonModel* model, CommonModel* spkModel);
  Recognizer(int index, float sampleRate, CommonModel* model, const std::string& grm, int);
  void main(int index);
  void safeDelete(bool _processCurrent);
  void acceptWaveform(int start, int len);
  void reset();
  void setEndpointerMode(VoskEndpointerMode mode);
  void setEndpointerDelays(float tStartMax, float tEnd, float tMax);
  void setSpkModel(CommonModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};