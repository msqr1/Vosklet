#include "Util.h"
#include <emscripten/em_asm.h>
ThreadPool globalPool;
void fireEv(int index, const char* content, const char* type) {
  MAIN_THREAD_EM_ASM({
    objs[$0].dispatchEvent(new CustomEvent($2 === 0 ? "0" : UTF8ToString($2), { "detail" : UTF8ToString($1) }));
  }, index, content, type);
}
int untar(unsigned char* tar, int tarSize, const std::string& storepath) {
  if(std::memcmp(tar + 257, "ustar", 5)) return IncorrectFormat;
  size_t size{};
  std::string path;
  path.reserve(100); // Max length
  unsigned char* end = tar + tarSize;
  while(tar <= end) {
    if(tar[156] != '5' && tar[156] != 0  && 
      tar[156] != '0') {
      return IncorrectFiletype;
    }
    path.clear();
    path += reinterpret_cast<char*>(tar + 345);
    path += reinterpret_cast<char*>(tar);
    tar += 124;
    for(int i{0}; i < 11; i++) {
      size *= 8;
      size += *tar - 48;
      tar++;
    }
    tar += 377;
    size_t firstSlash = path.find_first_of("/");
    if(firstSlash == std::string::npos) {
      if(size != 0) tar += size + 512 - size % 512;
      continue;
    }
    path = storepath + path.substr(firstSlash);
    std::ofstream file;
    if(size == 0) fs::create_directory(path);
    else {
      file.open(path, std::ios::trunc | std::ios::binary);
      if(!file) return FailedOpen;
      if(!file.write(reinterpret_cast<char*>(tar), size)) return FailedWrite;
      file.close();
      if(!file) return FailedClose;
      tar += size + 512 - size % 512;
    }
  }
  return Successful;
}
void Thread::startup(ThreadPool* pool) {
  while(!pool->done) {
    // Wait until unlocked
    emscripten_atomic_wait_u32(&pool->qLock, true, -1);
    if(pool->done) break;
    // If there is no task then everyone has to wait until there is more
    if(pool->taskQ.empty()) {
      emscripten_atomic_store_u32(&pool->qLock, true);
      continue;
    }
    // If this locks, the returned (loaded) value will be false, and we move on
    if(emscripten_atomic_cas_u32(&pool->qLock, false, true)) continue;
    fn = pool->taskQ.front();
    pool->taskQ.pop();
    // Unlock
    emscripten_atomic_store_u32(&pool->qLock, false);
    emscripten_atomic_notify(&pool->qLock, 1);
    fn();
  }   
}
ThreadPool::ThreadPool() {
  for(Thread& thrd : threads) {
    thrd.handle = std::thread{&Thread::startup, &thrd, this};
  }
}
ThreadPool::~ThreadPool() {
  done = true;
  emscripten_atomic_store_u32(&qLock, false);
  emscripten_atomic_notify(&qLock, -1);
  for(Thread& thrd : threads) {
    thrd.handle.detach();
  }
}
void ThreadPool::exec(std::function<void()> fn) {
  taskQ.emplace(fn);
  emscripten_atomic_store_u32(&qLock, false);
  emscripten_atomic_notify(&qLock, 1);
}