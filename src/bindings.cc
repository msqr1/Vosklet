#include "genericModel.h"
#include "recognizer.h"

#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());
  
  enum_<VoskEndpointerMode>("epMode")
  .value("ANSWER_DEFAULT", VOSK_EP_ANSWER_DEFAULT)
  .value("ANSWER_SHORT", VOSK_EP_ANSWER_SHORT)
  .value("ANSWER_LONG", VOSK_EP_ANSWER_LONG)
  .value("ANSWER_VERY_LONG", VOSK_EP_ANSWER_VERY_LONG);

  class_<genericModel>("genericModel")
  .constructor<int, bool, std::string, std::string>(allow_raw_pointers())
  .function("extractAndLoad", &genericModel::extractAndLoad, allow_raw_pointers());
  
  class_<recognizer>("recognizer") 
  .constructor<int, float, genericModel*>(allow_raw_pointers())
  .constructor<int, float, genericModel*, genericModel*>(allow_raw_pointers())
  .constructor<int, float, genericModel*, std::string, int>(allow_raw_pointers())
  .function("pushData", &recognizer::pushData, allow_raw_pointers())
  .function("reset", &recognizer::reset, allow_raw_pointers())
  .function("setEndpointerMode", &recognizer::setEndpointerMode, allow_raw_pointers())
  .function("setEndpointerDelays", &recognizer::setEndpointerDelays, allow_raw_pointers())
  .function("setWords", &recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &recognizer::setMaxAlternatives, allow_raw_pointers());
};