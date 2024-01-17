#include "spkModel.h"
#include "model.h"
#include "recognizer.h"
using namespace emscripten;
EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());
  class_<model, base<genericModel>>("__model__")
  .constructor<std::string, std::string, std::string, int>(allow_raw_pointers());

  class_<spkModel, base<genericModel>>("__spkModel__")
  .constructor<std::string, std::string, std::string, const int>(allow_raw_pointers());
  
  class_<recognizer, base<genericObj>>("__recognizer__") 
  .constructor<model*, int, int>(allow_raw_pointers())
  .function("start", &recognizer::start, allow_raw_pointers())
  .function("stop", &recognizer::stop, allow_raw_pointers())
  .function("deinit", &recognizer::deinit, allow_raw_pointers())
  .function("setWords", &recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &recognizer::setMaxAlternatives, allow_raw_pointers());
};