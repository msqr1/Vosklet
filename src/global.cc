#include "global.h"

pthread_t dstThrd{pthread_self()};
std::error_code tank{};
bool OPFSOk{};
ProxyingQueue glbQ{};

void fireEv(const char *type, const char *content, int index) {
  auto proxy{[index, type, content](){
    EM_ASM({
      objs[$0].dispatchEvent(new CustomEvent(UTF8ToString($1), {"detail" : UTF8ToString($2)}));
    },index, type, content);
  }};
  if(dstThrd == pthread_self()) {
    proxy();
    return;
  }
  glbQ.proxySync(dstThrd, proxy);
}

void reusableThrd::addTask(std::function<void()> task) {
  static std::thread thrd{[this](){
    while(!done.test()) {
      while(!queue.empty()) {
        queue.front()();
        queue.pop();
      }
      blocker.wait(done.test(std::memory_order_relaxed) || queue.empty(), std::memory_order_relaxed);
      blocker.clear(std::memory_order_relaxed);
    }
  }};
  thrd.detach();
  queue.emplace(std::move(task));
  blocker.test_and_set(std::memory_order_relaxed);
  blocker.notify_one();
}
reusableThrd::~reusableThrd() {
  done.test_and_set(std::memory_order_relaxed);
  done.notify_one();
}
int main() {
  std::thread t{[](){
    OPFSOk = wasmfs_create_directory("/opfs", 0777, wasmfs_create_opfs_backend()) == 0;
  }};
  t.detach();
  emscripten_exit_with_live_runtime();
}