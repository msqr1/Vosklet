#pragma once
#include "model.h"
#include "spkModel.h"
#include "global.h"

struct recognizer {
  std::atomic_flag done{};
  std::atomic_flag controller{};
  float* dataPtr{};
  int index{};
  VoskRecognizer* rec{};
  recognizer(model* model, float sampleRate, int index);
  recognizer(model* model, spkModel* spkModel, float sampleRate, int index);
  recognizer(model* model, const std::string& grm, float sampleRate, int index, int dummy);
  ~recognizer();
  void finishConstruction();
  void tryStealMdlThrd(std::function<void()>&& main, model* mdl);
  void acceptWaveForm();
  void setSpkModel(spkModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
