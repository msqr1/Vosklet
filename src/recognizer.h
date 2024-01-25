#pragma once
#include "model.h"
#include "spkModel.h"

#include <filesystem>
#include <atomic>
#include <thread>
#include <queue>

#include <emscripten/wasmfs.h>
#include <emscripten/webaudio.h>
#include <AL/al.h>
#include <AL/alc.h>
#include <archive.h>
#include <archive_entry.h>
extern void throwJS(const char* msg, bool err = false);
namespace fs = std::filesystem;

struct audioData {
  float* addr{};
  int len{};
  audioData(int addr, int len);
};
struct recognizer {
  int index{};
  VoskRecognizer* rec{};
  recognizer(model* model, float sampleRate, int index);
  ~recognizer();
  void acceptWaveForm(int addr, int len);
  void fireEv(const char* type, const char* content);
  void setSpkModel(spkModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
