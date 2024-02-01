#include "global.h"
static pthread_t selfTID{pthread_self()};
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
  auto proxy{[index, type, content](){
    EM_ASM({
      console.log("Event type ", UTF8ToString($1), ", content " , UTF8ToString($2), ", sending to ", objs[$0]);
      objs[$0].dispatchEvent(new CustomEvent(UTF8ToString($1), {"detail" : UTF8ToString($2)}));
    },index, type, content);
  }};
  if(selfTID == pthread_self()) {
    emscripten_console_log("Self dispatch");
    proxy();
    return;
  }
  emscripten_console_log("Thread dispatch");
  pq.proxySync(selfTID, proxy);
}

int main() {
  //vosk_set_log_level(-1);
  std::thread t{[](){
    wasmfs_create_directory("/opfs", 0777, wasmfs_create_opfs_backend());
  }};
  t.detach();
  emscripten_exit_with_live_runtime();
}