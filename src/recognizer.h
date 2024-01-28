#pragma once
#include "model.h"
#include "spkModel.h"
#include "global.h"

#include <filesystem>

#include <AL/al.h>
#include <AL/alc.h>
#include <archive.h>
#include <archive_entry.h>
#include <emscripten/proxying.h>
namespace fs = std::filesystem;
using namespace emscripten;
struct recognizer {
  std::atomic_flag done{};
  std::mutex controller{};
  float* dataPtr{};
  int index{};
  VoskRecognizer* rec{};
  recognizer(model* model, float sampleRate, int index);
  ~recognizer();
  void acceptWaveForm();
  void fireEv(const char* type, const char* content, const pthread_t& caller);
  void setSpkModel(spkModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
