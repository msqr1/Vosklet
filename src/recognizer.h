#pragma once
#include "genericModel.h"

struct recognizer {
  std::atomic_flag done{};
  std::atomic_flag controller{};
  float* dataPtr;
  int index;
  VoskRecognizer* rec;
  recognizer(int index, float sampleRate, genericModel* model);
  recognizer(int index, float sampleRate, genericModel* model, genericModel* spkModel);
  recognizer(int index, float sampleRate, genericModel* model, const std::string& grm,  int dummy);
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
