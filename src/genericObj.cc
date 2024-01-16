#include "genericObj.h"

void GenericObj::fireEv(const char *type, const char *content) {
  if(content == nullptr) {
    MAIN_THREAD_EM_ASM({
      __GenericObj__.objects[$0].dispatchEvent(new Event(UTF8ToString($1)));
    },this->index, type);
    return;
  }
  MAIN_THREAD_EM_ASM({
    __GenericObj__.objects[$0].dispatchEvent(new CustomEvent(UTF8ToString($0), {"details" : UTF8ToString($1)}));
  },this->index, type, content);
};
