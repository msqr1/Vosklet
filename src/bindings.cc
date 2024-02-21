#include "spkModel.h"
#include "model.h"
#include "recognizer.h"

#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());
  class_<model>("model")
  .constructor<std::string, std::string, int>(allow_raw_pointers())
  .function("checkModel", &model::checkModel, allow_raw_pointers())
  .function("afterFetch", &model::afterFetch, allow_raw_pointers())
  .function("load", &model::load, allow_raw_pointers());

  class_<spkModel>("spkModel")
  .constructor<std::string, std::string, int>(allow_raw_pointers())
  .function("checkModel", &spkModel::checkModel, allow_raw_pointers())
  .function("afterFetch", &spkModel::afterFetch, allow_raw_pointers())
  .function("load", &spkModel::load, allow_raw_pointers());
  
  class_<recognizer>("recognizer") 
  .constructor<model*, float, int>(allow_raw_pointers())
  .constructor<model*, spkModel*, float, int>(allow_raw_pointers())
  .constructor<model*, std::string, float, int, int>(allow_raw_pointers())
  .function("setWords", &recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &recognizer::setMaxAlternatives, allow_raw_pointers())
  .function("acceptWaveForm", &recognizer::acceptWaveForm, allow_raw_pointers());
};