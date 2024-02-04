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
  auto proxy{[index, type, content](){
    EM_ASM({
      objs[$0].dispatchEvent(new CustomEvent(UTF8ToString($1), {"detail" : UTF8ToString($2)}));
    },index, type, content);
  }};
  if(selfTID == pthread_self()) {
    proxy();
    return;
  }
  pq.proxySync(selfTID, proxy);
}
int main() {
  std::thread t{[](){
    wasmfs_create_directory("/opfs", 0777, wasmfs_create_opfs_backend());
  }};
  t.detach();
  emscripten_exit_with_live_runtime();
}
void twiceThrd::setTask1(std::function<void()> task1) {
  blocker.lock();
  std::thread t{[this, task1](){
    task1();
    blocker.lock(); 
    task2();
  }};
  t.detach();
}
void twiceThrd::setTask2(std::function<void()> task2) {
  this->task2 = task2;
  blocker.unlock();
  reusable = false;
}
