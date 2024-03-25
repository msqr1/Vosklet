#include "link.h"

pthread_t dstThrd{pthread_self()};
ProxyingQueue glbQ{};
void fireEv(int index, const char* content, const char* type) {
  auto proxy{[index, content, type](){
    EM_ASM({
      objs[$0].dispatchEvent(new CustomEvent($2 === 0 ? "0" : UTF8ToString($2), { "detail" : UTF8ToString($1) }));
    }, index, content, type);
  }};
  if(dstThrd == pthread_self()) proxy();
  else glbQ.proxySync(dstThrd, proxy);
}
void fireEv(int index, char* state, float* dataBuf) {
  auto proxy{[index, state, dataBuf](){
    EM_ASM({
      objs[$0].dispatchEvent(new CustomEvent("0", { "detail" : $1 + "," + $2}));
    }, index, state, dataBuf);
  }};
  if(dstThrd == pthread_self()) proxy();
  else glbQ.proxySync(dstThrd, proxy);
}
