#pragma once
#include "genericModel.h"
#include "jsBridge.h"

struct recognizer {
  std::atomic_flag done{};
  std::atomic_flag controller{};
  float* dataPtr;
  int index;
  VoskRecognizer* rec;
  recognizer(genericModel* model, float sampleRate, int index);
  recognizer(genericModel* model, genericModel* spkModel, float sampleRate, int index);
  recognizer(genericModel* model, const std::string& grm, float sampleRate, int index, int dummy);
  ~recognizer();
  void finishConstruction(genericModel* model, genericModel* spkModel);
  void acceptWaveForm();
  void setSpkModel(genericModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
