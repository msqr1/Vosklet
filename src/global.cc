#include "global.h"

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
    OPFSOk = (wasmfs_create_directory("/opfs", 0777, wasmfs_create_opfs_backend()) == 0 ? true : false);
  }};
  t.detach();
  emscripten_exit_with_live_runtime();
}
ProxyingQueue reusableThrd::pq{};
reusableThrd::reusableThrd() {
  thrd = std::thread{[this](){
    while(!done.test()) {
      static ProxyingQueue pq{};
      pq.execute();
      blocker.wait(done.test(), std::memory_order_relaxed);
    }
  }};
  thrd.detach();
}
void reusableThrd::addTask(std::function<void()> task) {
  pq.proxyAsync(thrd.native_handle(), std::move(task));
}
reusableThrd::~reusableThrd() {
  done.test_and_set(std::memory_order_relaxed);
  done.notify_one();
}
