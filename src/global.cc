#include "global.h"
void throwJS(const char* msg, bool err) {
  EM_ASM({
    if($1) {
      throw Error(UTF8ToString($0));
      return;
    }
    throw UTF8ToString($0);
  },msg, err);
}
int main() {
  //vosk_set_log_level(-1);
  std::thread t{[](){
    wasmfs_create_directory("/opfs",0777,wasmfs_create_opfs_backend());
  }};
  t.detach();
}