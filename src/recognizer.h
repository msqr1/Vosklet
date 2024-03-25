#pragma once
#include "genericModel.h"

#include <AL/al.h>
#include <AL/alc.h>

struct recognizer {
  std::atomic_flag done{};
  char state; // 0: Copying data from JS, 1: Processing from C++
  float dataBuf[128];
  float sampleRate;
  int index;
  VoskRecognizer* rec;
  recognizer(int index, float sampleRate, genericModel* model);
  recognizer(int index, float sampleRate, genericModel* model, genericModel* spkModel);
  recognizer(int index, float sampleRate, genericModel* model, const std::string& grm, int dummy);
  ~recognizer();
  void reset();
  void finishConstruction(genericModel* model, genericModel* spkModel = nullptr);
  void setEndpointerMode(VoskEndpointerMode mode);
  void setEndpointerDelays(float tStartMax, float tEnd, float tMax);
  void acceptWaveForm();
  void setSpkModel(genericModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
