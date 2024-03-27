#pragma once
#include "genericModel.h"

#include <queue>

#include <emscripten/console.h>

struct audioData {
  float* data;
  int len;
  audioData(int start, int len) : data{reinterpret_cast<float*>(start)}, len{len} {}
};
struct recognizer {
  std::atomic_bool done{};
  std::atomic_bool blocker{};
  int index;
  VoskRecognizer* rec;
  std::queue<audioData> dataQ{};
  recognizer(int index, float sampleRate, genericModel* model);
  recognizer(int index, float sampleRate, genericModel* model, genericModel* spkModel);
  recognizer(int index, float sampleRate, genericModel* model, const std::string& grm, int dummy);
  ~recognizer();
  void finishConstruction(genericModel* model, genericModel* spkModel = nullptr);
  void pushData(int start, int len);
  void reset();
  void setEndpointerMode(VoskEndpointerMode mode);
  void setEndpointerDelays(float tStartMax, float tEnd, float tMax);
  void setSpkModel(genericModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
