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

class Recognizer : public GenericObj {
  VoskRecognizer* recognizer{};
  ALCdevice* mic{};
  std::atomic_flag done {false};
  std::atomic_flag controller{false};
  void main();
public:
  Recognizer(Model* model, int sampleRate, int index);
  void start();
  void stop();
  void deinit();
  void setSpkModel(SpkModel* model);
  void setGrm(const std::string& grm);
  void setWords(bool words);
  void setPartialWords(bool partialWords);
  void setNLSML(bool nlsml);
  void setMaxAlternatives(int alts);
};
