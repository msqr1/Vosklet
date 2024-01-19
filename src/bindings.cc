#include "spkModel.h"
#include "model.h"
#include "recognizer.h"
using namespace emscripten;
int main() {
  //vosk_set_log_level(-1);
  std::thread t{[](){
    wasmfs_create_directory("/opfs",0777,wasmfs_create_opfs_backend());
  }};
  t.detach();
}
EMSCRIPTEN_BINDINGS() {
  function("setLogLevel", &vosk_set_log_level, allow_raw_pointers());
  class_<model>("__model__")
  .constructor<std::string, std::string, std::string, int>(allow_raw_pointers());

  class_<spkModel>("__spkModel__")
  .constructor<std::string, std::string, std::string, const int>(allow_raw_pointers());
  
  class_<recognizer>("__recognizer__") 
  .constructor<model*, int, int>(allow_raw_pointers())
  .function("start", &recognizer::start, allow_raw_pointers())
  .function("stop", &recognizer::stop, allow_raw_pointers())
  .function("setWords", &recognizer::setWords, allow_raw_pointers())
  .function("setPartialWords", &recognizer::setPartialWords, allow_raw_pointers())
  .function("setGrm", &recognizer::setGrm, allow_raw_pointers())
  .function("setNLSML", &recognizer::setNLSML, allow_raw_pointers())
  .function("setSpkModel", &recognizer::setSpkModel, allow_raw_pointers())
  .function("setMaxAlternatives", &recognizer::setMaxAlternatives, allow_raw_pointers());
};