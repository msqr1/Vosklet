#pragma once
#include "CommonModel.h"

#include <queue>

#include <emscripten/console.h>

// Prevent naming conflicts with Vosk's Recognizer class
#define Recognizer Recognizer_

struct Recognizer {
  bool done{};
  std::atomic_bool blocker{};
  int index;
  std::thread t;
  VoskRecognizer* rec;
  std::queue<AudioData> dataQ;
  Recognizer(int index, float sampleRate, CommonModel* model);
  Recognizer(int index, float sampleRate, CommonModel* model, CommonModel* spkModel);
  Recognizer(int index, float sampleRate, CommonModel* model, const std::string& grm, int);
  ~Recognizer();
  void finishConstruction(CommonModel* model, CommonModel* spkModel = nullptr);
  void main();
  void pushData(int start, int len);
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