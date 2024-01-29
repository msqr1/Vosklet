#include "global.h"
// Throw error for user, or just throw the message for internal communication
void throwJS(const char* msg, bool err) {
  static pthread_t targetThrd{pthread_self()};
  static ProxyingQueue pq{};
  if(pthread_self() == targetThrd) {
    EM_ASM({
      if($1) {
        throw Error(UTF8ToString($0));
        return;
      }
      throw UTF8ToString($0);
    },msg, err);
  }
  pq.proxyAsync(targetThrd, [&](){
    EM_ASM({
      if($1) {
        throw Error(UTF8ToString($0));
        return;
      }
      throw UTF8ToString($0);
    },msg, err);
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