#include "Util.h"

#include "emscripten/em_js.h"
#include <cstring>

int untar(unsigned char *tar, int tarSize, const char *storepath)
{
  if (std::memcmp(tar + 257, "ustar", 5))
    return IncorrectFormat;
  size_t size{};
  std::string path;
  path.reserve(100); // Max length
  unsigned char *end = tar + tarSize;
  while (tar <= end)
  {
    if (tar[156] != '5' && tar[156] != 0 &&
        tar[156] != '0')
    {
      return IncorrectFiletype;
    }
    path.clear();
    path += reinterpret_cast<char *>(tar + 345);
    path += reinterpret_cast<char *>(tar);
    tar += 124;
    for (int i{0}; i < 11; i++)
    {
      size *= 8;
      size += *tar - 48;
      tar++;
    }
    tar += 377;
    size_t firstSlash = path.find_first_of("/");
    if (firstSlash == std::string::npos)
    {
      if (size != 0)
        tar += size + 512 - size % 512;
      continue;
    }
    path = storepath + path.substr(firstSlash);
    std::ofstream file;
    if (size == 0)
      fs::create_directory(path);
    else
    {
      file.open(path, std::ios::trunc | std::ios::binary);
      if (!file)
        return FailedOpen;
      if (!file.write(reinterpret_cast<char *>(tar), size))
        return FailedWrite;
      file.close();
      if (!file)
        return FailedClose;
      tar += size + 512 - size % 512;
    }
  }
  return Successful;
}