#include "spkModel.h"
#include "model.h"
#include "recognizer.h"
using namespace emscripten;

EMSCRIPTEN_BINDINGS(BrowserRecognizer) {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());

  class_<Model>("__Model__")
  .constructor<std::string, std::string, std::string, int>(allow_raw_pointers());

  class_<SpkModel>("__SpkModel__")
  .constructor<std::string, std::string, std::string, const int>(allow_raw_pointers());
  
  class_<Recognizer>("__Recognizer__") 
  .constructor<Model*, int, int>(allow_raw_pointers())
  .function("start", &Recognizer::start, allow_raw_pointers())
  .function("stop", &Recognizer::stop, allow_raw_pointers())
  .function("deinit", &Recognizer::deinit, allow_raw_pointers())
  .function("setWords", &Recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &Recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &Recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &Recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &Recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &Recognizer::setMaxAlternatives, allow_raw_pointers());
};