#include "genericObj.h"

void genericObj::fireEv(const char *type, const char *content) {
  if(content == nullptr) {
    EM_ASM({
      __genericObj__.objects[$0].dispatchEvent(new Event(UTF8ToString($1)));
    },this->index, type);
    return;
  }
  EM_ASM({
    __genericObj__.objects[$0].dispatchEvent(new CustomEvent(UTF8ToString($0), {"details" : UTF8ToString($1)}));
  },this->index, type, content);
}
