#include "CommonModel.h"
#include "Recognizer.h"

#include <emscripten/bind.h>
using namespace emscripten;

EMSCRIPTEN_BINDINGS()
{
  function("setLogLevel", &vosk_set_log_level);

  enum_<VoskEndpointerMode>("EpMode")
      .value("ANSWER_DEFAULT", VOSK_EP_ANSWER_DEFAULT)
      .value("ANSWER_SHORT", VOSK_EP_ANSWER_SHORT)
      .value("ANSWER_LONG", VOSK_EP_ANSWER_LONG)
      .value("ANSWER_VERY_LONG", VOSK_EP_ANSWER_VERY_LONG);

  class_<CommonModel>("CommonModel")
      .constructor<int, bool, int, int>(return_value_policy::take_ownership())
      .function("findWord", &CommonModel::findWord);

  class_<Recognizer>("Recognizer")
      .constructor<int, float, CommonModel *>(return_value_policy::take_ownership())
      .constructor<int, float, CommonModel *, CommonModel *>(return_value_policy::take_ownership())
      .constructor<int, float, CommonModel *, const std::string &, int>(return_value_policy::take_ownership())
      .function("acceptWaveform", &Recognizer::acceptWaveform, allow_raw_pointers())
      .function("reset", &Recognizer::reset)
      .function("setEndpointerMode", &Recognizer::setEndpointerMode)
      .function("setEndpointerDelays", &Recognizer::setEndpointerDelays)
      .function("setWords", &Recognizer::setWords)
      .function("setPartialWords", &Recognizer::setPartialWords)
      .function("setGrm", &Recognizer::setGrm)
      .function("setNLSML", &Recognizer::setNLSML)
      .function("setSpkModel", &Recognizer::setSpkModel, allow_raw_pointers())
      .function("setMaxAlternatives", &Recognizer::setMaxAlternatives);
};