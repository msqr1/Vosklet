#include "spkModel.h"
#include "model.h"
#include "recognizer.h"
#include <emscripten/bind.h>
using namespace emscripten;
EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());
  class_<model>("Model")
  .constructor<std::string, std::string>(allow_raw_pointers())
  .function("checkModelFiles", &model::checkModelFiles, allow_raw_pointers())
  .function("checkModelId", &model::checkModelId, allow_raw_pointers())
  .function("afterFetch", &model::afterFetch, allow_raw_pointers());

  class_<spkModel>("SpkModel")
  .constructor<std::string, std::string>(allow_raw_pointers())
  .function("checkModelFiles", &spkModel::checkModelFiles, allow_raw_pointers())
  .function("checkModelId", &spkModel::checkModelId, allow_raw_pointers())
  .function("afterFetch", &spkModel::afterFetch, allow_raw_pointers());
  
  class_<recognizer>("recognizer") 
  .constructor<model*, float, int>(allow_raw_pointers())
  .function("setWords", &recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &recognizer::setMaxAlternatives, allow_raw_pointers())
  .function("acceptWaveForm", &recognizer::acceptWaveForm, allow_raw_pointers());
};