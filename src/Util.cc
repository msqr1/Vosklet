#include "Util.h"
void fireEv(int index, const char* content, const char* type) {
  MAIN_THREAD_EM_ASM({
    objs[$0].dispatchEvent(new CustomEvent($2 === 0 ? "0" : UTF8ToString($2), { "detail" : UTF8ToString($1) }));
  }, index, content, type);
}
int untar(unsigned char* tar, int tarSize, const std::string& storepath) {
  if(memcmp(tar + 257, "ustar", 5)) return IncorrectFormat;
  unsigned char* ptr = tar;
  size_t size{0};
  std::string path{};
  path.reserve(100); // Max length
  unsigned char* end = tar + tarSize;
  while(ptr <= end) {
    if(ptr[156] != '5' && ptr[156] != 0  && 
      ptr[156] != '0') {
      return IncorrectFiletype;
    }
    path.clear();
    path += reinterpret_cast<char*>(ptr + 345);
    path += reinterpret_cast<char*>(ptr);
    ptr += 124;
    for(int i{0}; i < 11; i++) {
      size *= 8;
      size += *ptr - 48;
      ptr++;
    }
    ptr += 377;
    size_t firstSlash = path.find_first_of("/");
    if(firstSlash == std::string::npos) {
      if(size != 0) ptr += size + 512 - size % 512;
      continue;
    }
    path = storepath + path.substr(firstSlash);
    if(size == 0) fs::create_directory(path);
    else {
      int fd {open(path.c_str(), O_CREAT | O_WRONLY | O_TRUNC, 0777)};
      if(fd == -1) return FailedOpen;
      int res = write(fd, ptr, size);
      if(res == -1) return FailedWrite;
      if(close(fd) == -1) return FailedClose;
      ptr += size + 512 - size % 512;
    }
  }
  return Successful;
}