#include "spkModel.h"
#include "model.h"
#include "recognizer.h"
#include <emscripten/bind.h>
using namespace emscripten;
void throwJS(const char* msg, bool err = false) {
  EM_ASM({
    if($1) {
      throw Error(UTF8ToString)
      return
    }
    throw UTF8ToString($0)
  },msg, err);
}
int main() {
  //vosk_set_log_level(-1);
  std::thread t{[](){
    wasmfs_create_directory("/opfs",0777,wasmfs_create_opfs_backend());
  }};
  t.detach();
}
EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());
  class_<model>("Model")
  .constructor<std::string, std::string, std::string>(allow_raw_pointers());

  class_<spkModel>("SpkModel")
  .constructor<std::string, std::string, std::string>(allow_raw_pointers());
  
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