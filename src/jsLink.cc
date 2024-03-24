#include <jsLink.h>

pthread_t dstThrd{pthread_self()};
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