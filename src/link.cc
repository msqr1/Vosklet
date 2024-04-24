#include "link.h"

void fireEv(int index, const char* content, const char* type) {
  MAIN_THREAD_EM_ASM({
    objs[$0].dispatchEvent(new CustomEvent($2 === 0 ? "0" : UTF8ToString($2), { "detail" : UTF8ToString($1) }));
  }, index, content, type);
}
