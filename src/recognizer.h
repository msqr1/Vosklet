#pragma once
#include "model.h"
#include "spkModel.h"
#include "genericObj.h"

#include <filesystem>
#include <atomic>
#include <thread>

#include <emscripten/bind.h>
#include <emscripten/wasmfs.h>
#include <emscripten/console.h>
#include <AL/al.h>
#include <AL/alc.h>
#include <archive.h>
#include <archive_entry.h>
namespace fs = std::filesystem;

struct recognizer {
  int index{};
  VoskRecognizer* rec{};
  void acceptWaveForm(float* data, int len);
  recognizer(model* model, float sampleRate, int index);
  ~recognizer();
  void fireEv(const char* type, const char* content);
  void setSpkModel(spkModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
