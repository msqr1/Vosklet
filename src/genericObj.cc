#include "genericObj.h"

void genericObj::fireEv(const char *type, const char *content) {
  EM_ASM({
    if($0 === 0) {
      __genericObj__.objects[$0].dispatchEvent(new Event(UTF8ToString($1)));
      return;
    }
    __genericObj__.objects[$0].dispatchEvent(new CustomEvent(UTF8ToString($1), {"details" : UTF8ToString($2)}));
  },this->index, type, content);
}
