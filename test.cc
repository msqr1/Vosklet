#include <emscripten.h>
#include <emscripten/console.h>
#include <emscripten/bind.h>
using namespace emscripten;
struct A {
  void doit() {
    char bro[] {"Bro"};
    MAIN_THREAD_EM_ASM({
      console.log(UTF8ToString($0));
    },bro);
  }
  ~A() {
    emscripten_console_log("Destructor called");
  }
};
EMSCRIPTEN_BINDINGS() {
  class_<A>("A")
  .smart_ptr_constructor<
}