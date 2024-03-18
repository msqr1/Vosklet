// Taken from https://github.com/libarchive/libarchive/blob/master/contrib/untar.c
// Stripped all the way down for smallest size

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <filesystem>
#include <emscripten/console.h>
namespace fs = std::filesystem;

#define TO_STRING(x) #x
#define STR(x) TO_STRING(x)

/* Parse an octal number, ignoring leading and trailing nonsense. */
int parseoct(const char *p, size_t n)
{
	int i = 0;

	while ((*p < '0' || *p > '7') && n > 0) {
		++p;
		--n;
	}
	while (*p >= '0' && *p <= '7' && n > 0) {
		i *= 8;
		i += *p - '0';
		++p;
		--n;
	}
	return i;
}

/* Returns true if this is 512 zero bytes. */
bool is_end_of_archive(const char *p)
{
	int n;
	for (n = 511; n >= 0; --n)
		if (p[n] != '\0')
			return false;
	return true;
}

/* Create a file, including parent directory as necessary. */
FILE * create_file(char *pathname) {
	FILE *f;
	if (f == NULL) {
		/* Try creating parent dir and then creating file. */
		char *p = strrchr(pathname, '/');
		if (p != NULL) {
			*p = '\0';
			fs::create_directories(pathname);
			*p = '/';
			f = fopen(pathname, "wb+");
		}
	}
	return f;
}

/* Verify the tar checksum. */
int verify_checksum(const char *p)
{
	int n, u = 0;
	for (n = 0; n < 512; ++n) {
		if (n < 148 || n > 155)
			/* Standard tar checksum adds unsigned bytes. */
			u += ((unsigned char *)p)[n];
		else
			u += 0x20;

	}
	return (u == parseoct(p + 148, 8));
}

/* Extract a tar archive. */
bool untar(FILE *a, const char *path)
{
	char buff[512];
	FILE *f = NULL;
	size_t bytes_read;
	off_t filesize;

	emscripten_console_logf("Extracting from %s", path);
	for (;;) {
		bytes_read = fread(buff, 1, 512, a);
		if (bytes_read < 512) {
			emscripten_console_logf("Short read on %s", path);
			return false;
		}
		if (is_end_of_archive(buff)) {
			emscripten_console_logf("End of %s", path);
			return true;
		}
		if (!verify_checksum(buff)) {
			emscripten_console_log("Checksum failure");
			return false;
		}
		filesize = parseoct(buff + 124, 12);
		switch (buff[156]) {
			// Directory
			case '5':
				emscripten_console_logf(" Extracting dir %s", buff);
				fs::create_directories(buff);
				filesize = 0;
				break;
			// Normal file
			case '0':
			case '\0':
				emscripten_console_logf(" Extracting file %s", buff);
				f = create_file(buff);
		}
		while (filesize > 0) {
			bytes_read = fread(buff, 1, 512, a);
			if (bytes_read < 512) {
				emscripten_console_logf("Short read on %s", path);
				return false;
			}
			if (filesize < 512)
				bytes_read = filesize;
			if (f != NULL) {
				if (fwrite(buff, 1, bytes_read, f)
					!= bytes_read)
				{
					emscripten_console_log("Failed write");
					fclose(f);
					f = NULL;
				}
			}
			filesize -= (off_t)bytes_read;
		}
		if (f != NULL) {
			fclose(f);
			f = NULL;
		}
	}
	return true;
}