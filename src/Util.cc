#include "Util.h"
#include <emscripten/wasm_worker.h>
#include <emscripten/em_js.h>

EM_JS(void, mtFireEv, (int index, int typeIdx, int content), {
  objs[index].dispatchEvent(new CustomEvent(events[typeIdx], { "detail" : content == 0 ? null : UTF8ToString(content) }));
});
void fireEv(int index, int typeIdx, const char* content) {
  emscripten_wasm_worker_post_function_viii(0, mtFireEv, index, typeIdx, reinterpret_cast<int>(content));
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
void Worker::startup(int _fn, int _pool) {
  WorkerPool& pool{*reinterpret_cast<WorkerPool*>(_pool)};
  std::function<void()>& fn{*reinterpret_cast<std::function<void()>*>(_fn)};
  while(!pool.done) {
    // Wait until unlocked
    emscripten_atomic_wait_u32(&pool.qLock, true, -1);
    if(pool.done) break;
    // If there is no task then everyone has to wait until there is more
    if(pool.taskQ.empty()) {
      emscripten_atomic_store_u32(&pool.qLock, true);
      continue;
    }
    // If this locks, the returned (loaded) value will be false, and we move on
    if(emscripten_atomic_cas_u32(&pool.qLock, false, true)) continue;
    fn = pool.taskQ.front();
    pool.taskQ.pop();
    // Unlock
    emscripten_atomic_store_u32(&pool.qLock, false);
    emscripten_atomic_notify(&pool.qLock, 1);
    fn();
  }
}
static constexpr int workerStack{65536};
static std::array<std::byte, MAX_WORKERS * workerStack> stacks;
#undef MAX_WORKERS
WorkerPool::WorkerPool() {
  for(int i = 0; i < workers.size(); i++) {
    workers[i].handle = emscripten_create_wasm_worker(&stacks[i * workerStack], workerStack);
    emscripten_wasm_worker_post_function_vii(workers[i].handle, Worker::startup, reinterpret_cast<int>(&workers[i].fn),reinterpret_cast<int>(this));
  }
}
WorkerPool::~WorkerPool() {
  done = true;
  emscripten_atomic_store_u32(&qLock, false);
  emscripten_atomic_notify(&qLock, -1);
  emscripten_terminate_all_wasm_workers();
}
void WorkerPool::exec(std::function<void()> fn) {
  taskQ.emplace(fn);
  emscripten_atomic_store_u32(&qLock, false);
  emscripten_atomic_notify(&qLock, 1);
}
WorkerPool globalPool;