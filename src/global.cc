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
  static pthread_t selfTID{pthread_self()};
  static auto proxy{[&](){
    EM_ASM({
      console.log(objs[$0]);
      objs[$0].dispatchEvent(new CustomEvent(UTF8ToString($1), {"detail" : UTF8ToString($2)}))
    },index, type, content);
  }};
  if(selfTID == pthread_self()) {
    proxy();
    return;
  }
  pq.proxySync(selfTID, proxy);
}
  
int main() {
  //vosk_set_log_level(-1);
  std::thread t{[](){
    wasmfs_create_directory("/opfs",0777,wasmfs_create_opfs_backend());
    fireEv("_ev", "test", 0);
  }};
  t.detach();
  fireEv("_ev", "test event", 0);
  emscripten_exit_with_live_runtime();
}