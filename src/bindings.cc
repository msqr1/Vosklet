#include "genericModel.h"
#include "recognizer.h"

#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());
  class_<genericModel>("genericModel")
  .constructor<std::string, std::string, int, bool>(allow_raw_pointers())
  .function("check", &genericModel::check, allow_raw_pointers())
  .function("afterFetch", &genericModel::afterFetch, allow_raw_pointers());
  
  class_<recognizer>("recognizer") 
  .constructor<genericModel*, float, int>(allow_raw_pointers())
  .constructor<genericModel*, genericModel*, float, int>(allow_raw_pointers())
  .constructor<genericModel*, std::string, float, int, int>(allow_raw_pointers())
  .function("setWords", &recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &recognizer::setMaxAlternatives, allow_raw_pointers())
  .function("acceptWaveForm", &recognizer::acceptWaveForm, allow_raw_pointers());
};