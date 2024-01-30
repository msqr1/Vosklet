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
void fireEv(const char *type, const char *content, int index) {
  static ProxyingQueue pq{};
  static pthread_t selfTID {pthread_self()};
  pq.proxySync(selfTID, [&](){
    EM_ASM({
      let ev = new CustomEvent(UTF8ToString($1), {"details" : UTF8ToString($2)});
      objs[$0].dispatchEvent(ev);
      console.log(objs[$0], ev)
    },index, type, content);
  });
}
  
int main() {
  //vosk_set_log_level(-1);
  std::thread t{[](){
    wasmfs_create_directory("/opfs",0777,wasmfs_create_opfs_backend());
  }};
  t.detach();
  emscripten_exit_with_live_runtime();
}