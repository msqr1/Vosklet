#pragma once
#include "model.h"
#include "spkModel.h"
#include "global.h"

#include <filesystem>
namespace fs = std::filesystem;

struct recognizer {
  std::atomic_flag done{};
  std::atomic_flag controller{};
  float* dataPtr{};
  int index{};
  VoskRecognizer* rec{};
  recognizer(model* model, float sampleRate, int index);
  ~recognizer();
  void acceptWaveForm();
  void setSpkModel(spkModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
