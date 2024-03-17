#include "global.h"

pthread_t dstThrd{pthread_self()};
bool OPFSOk{};
bool OPFSTried{};
ProxyingQueue glbQ{};
void fireEv(int index, const char* content, const char* type) {
  auto proxy{[index, content, type](){
    emscripten_console_logf("Firing event, index: %d, content: %s, type: %s", index, content, type);
    EM_ASM({
      console.log(objs[$0]);
      objs[$0].dispatchEvent(new CustomEvent($2 === 0 ? "0" : UTF8ToString($2), {"detail" : UTF8ToString($1)}));
    }, index, content, type);
  }};
  if(dstThrd == pthread_self()) proxy();
  else glbQ.proxySync(dstThrd, proxy);
}
reusableThrd::reusableThrd() {
  std::thread thrd{[this](){
    while(!done.test(std::memory_order_relaxed)) {
      blocker.wait(queue.empty() || done.test(std::memory_order_relaxed),  std::memory_order_relaxed);
      blocker.clear(std::memory_order_relaxed);
      while(!queue.empty()) {
        emscripten_console_log("==========Executing task===========");
        queue.front()();
        queue.pop();
      }
    }
  }};
  thrd.detach();
}
void reusableThrd::addTask(std::function<void()>&& task) {
  queue.emplace(task);
  // The following line will make -O3 magically work. Yes, I know, it is a god dang PRINT STATEMENT.
  //emscripten_console_log("");
  blocker.test_and_set(std::memory_order_relaxed);
  blocker.notify_one();
}
reusableThrd::~reusableThrd() {
  done.test_and_set(std::memory_order_relaxed);
  done.notify_one();
}