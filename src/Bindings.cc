#include "CommonModel.h"
#include "Recognizer.h"

#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());

  enum_<VoskEndpointerMode>("EpMode")
  .value("ANSWER_DEFAULT", VOSK_EP_ANSWER_DEFAULT)
  .value("ANSWER_SHORT", VOSK_EP_ANSWER_SHORT)
  .value("ANSWER_LONG", VOSK_EP_ANSWER_LONG)
  .value("ANSWER_VERY_LONG", VOSK_EP_ANSWER_VERY_LONG);

  class_<CommonModel>("CommonModel")
  .constructor<int, bool, std::string, std::string, int, int>(allow_raw_pointers())
  .function("findWord", &CommonModel::findWord, allow_raw_pointers());

  class_<Recognizer>("Recognizer")
  .constructor<int, float, CommonModel*>(allow_raw_pointers())
  .constructor<int, float, CommonModel*, CommonModel*>(allow_raw_pointers())
  .constructor<int, float, CommonModel*, std::string, int>(allow_raw_pointers())
  .function("pushData", &Recognizer::pushData, allow_raw_pointers())
  .function("reset", &Recognizer::reset, allow_raw_pointers())
  .function("setEndpointerMode", &Recognizer::setEndpointerMode, allow_raw_pointers())
  .function("setEndpointerDelays", &Recognizer::setEndpointerDelays, allow_raw_pointers())
  .function("setWords", &Recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &Recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &Recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &Recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &Recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &Recognizer::setMaxAlternatives, allow_raw_pointers());
};