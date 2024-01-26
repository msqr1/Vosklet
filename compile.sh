  ####  ####  ####     ###   ####  #   #  ####  #      ####  ####  ####  ####  ####
  #     #  #  #  #     # ##  #     #   #  #     #      #  #  #  #  #     #  #  #
  ####  #  #  ####     #  #  ####   # #   ####  #      #  #  ####  ####  ####  ####
  #     #  #  # #      # ##  #      # #   #     #      #  #  #     #     # #      #
  #     ####  #  #     ###   ####    #    ####  #####  ####  #     ####  #  #  ####

# Total build time is around 45 minutes, mostly from building Kaldi
sudo apt install shtool libtool autogen autotools-dev pkg-config make &&

MAX_MEMORY=${MAX_MEMORY:-300mb} &&
MAX_THREADS=${MAX_THREADS:-2} &&
EMSDK=${EMSDK:-$(realpath .)} &&
COMPILE_JOBS=${COMPILE_JOBS:-$(nproc)} &&

SRC=$(realpath src) &&
KALDI=$(realpath kaldi) &&
VOSK=$(realpath vosk-api) &&
OPENFST=$KALDI/tools/openfst &&
LIBARCHIVE=$(realpath libarchive) &&
ZSTD=$(realpath zstd) && 
CLAPACK_WASM=$(realpath clapack-wasm) &&

if [ ! -d $EMSDK_PATH ]; then
  echo "Invalid EMSDK path"
  exit 1
fi
if [ $MAX_THREAD -lt 2 ]; then
  echo "MAX_THREAD be greater or equal to 2" &&
  exit 1
fi
if ! [[ $MAX_MEMORY =~ ^[0-9]+([kmgt]b)?$ ]]; then
  echo "MAX_MEMORY valid suffixes are kb, mb, gb, tb, none (bytes)" &&
  exit 1
fi 
if [ $(realpath $EMSDK) == $(realpath emsdk) ]; then
  echo "EMSDK is current directory, installing emsdk and Emscripten..." &&
  git clone --depth=1 https://github.com/emscripten-core/emsdk.git &&
  cd emsdk &&
  ./emsdk install 3.1.51 &&
  ./emsdk activate 3.1.51 
fi

. $EMSDK/emsdk_env.sh &&
export PATH=:$PATH:$EMSDK/upstream/bin &&

rm -rf /tmp/zstd &&
rm -rf /tmp/libarchive &&
rm -rf /tmp/openfst &&

cd $SRC &&
git clone -b v1.5.5 --depth=1 https://github.com/facebook/zstd /tmp/zstd &&
git clone -b v3.7.2 --depth=1 https://github.com/libarchive/libarchive /tmp/libarchive &&
git clone --depth=1 https://gitlab.inria.fr/multispeech/kaldi.web/clapack-wasm.git &&
git clone --depth=1 https://github.com/alphacep/openfst /tmp/openfst &&
git clone -b vosk --depth=1 https://github.com/alphacep/kaldi &&
git clone -b go/v0.3.46 --depth=1 https://github.com/alphacep/vosk-api &&

cd /tmp/zstd && 
HAVE_THREAD=0 ZSTD_LEGACY_SUPPORT=0 HAVE_ZLIB=0 HAVE_LZMA=0 HAVE_LZ4=0 ZSTD_NOBENCH=1 ZSTD_NODICT=1 ZSTD_NOCOMPRESS=1 BACKTRACE=0 PREFIX=$SRC/zstd CPPFLAGS="-O3 -flto" LDFLAGS="-O3 -flto" emmake make -j$COMPILE_JOBS install &&
rm -rf /tmp/zstd &&

cd /tmp/libarchive && 
build/autogen.sh && 
CPPFLAGS="-I$ZSTD/include -flto" LDFLAGS="-L$ZSTD/lib -flto" emconfigure ./configure --prefix=$SRC/libarchive --without-lz4 --without-lzma --without-zlib --without-bz2lib --without-xml2 --without-expat --without-cng --without-openssl --without-libb2 --disable-bsdunzip --disable-xattr --disable-acl --disable-bsdcpio --disable-bsdcat --disable-rpath --disable-maintainer-mode --disable-dependency-tracking --enable-static --disable-shared && 
emmake make -j$COMPILE_JOBS install &&
rm -rf /tmp/libarchive &&

cd $CLAPACK_WASM &&
bash ./install_repo.sh emcc &&

cd /tmp/openfst &&
autoreconf -i &&
CXXFLAGS="-pthread -r -O3 -flto"  LDFLAGS="-O3 -pthread -flto" emconfigure ./configure --prefix=$OPENFST --enable-static --disable-shared --enable-ngram-fsts --enable-lookahead-fsts --disable-bin --with-pic && 
emmake make -j$COMPILE_JOBS install &&
echo "PACKAGE_VERSION = 1.8.0" >> $OPENFST/Makefile &&

cd $KALDI/src &&
git apply $SRC/kaldi.patch &&
CXXFLAGS="-O3 -msimd128 -UHAVE_EXECINFO_H -pthread -flto" LDFLAGS="-O3 -sERROR_ON_UNDEFINED_SYMBOLS=0 -lembind -pthread -flto" emconfigure ./configure --use-cuda=no --with-cudadecoder=no --static --static-math=yes --static-fst=yes  --debug-level=0 --double-precision=yes --clapack-root=$CLAPACK_WASM --host=WASM && 
emmake make -j$COMPILE_JOBS online2 lm rnnlm &&

cd $VOSK/src &&
git apply $SRC/vosk.patch &&
VOSK_FILES="recognizer.cc language_model.cc model.cc spk_model.cc vosk_api.cc" &&
em++ -pthread -O3 -flto -Wno-deprecated -I. -I$KALDI/src -I$OPENFST/include $VOSK_FILES -c &&
emar -rcs vosk.a ${VOSK_FILES//.cc/.o} &&

cd $SRC &&
em++ -O3 genericModel.cc model.cc spkModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sEMBIND_STD_STRING_IS_UTF8 -sSUPPORT_LONGJMP=0 -sMODULARIZE -sEXPORT_NAME=loadBR -sENVIRONMENT=web,worker -sINITIAL_MEMORY=32pf -sASYNCIFY -sPTHREAD_POOL_SIZE=$MAX_THREAD -sPTHREAD_POOL_SIZE_STRICT -sPTHREAD_POOL_DELAY_LOAD -sASYNCIFY_ONLY=['emscripten_wget'] -sALLOW_BLOCKING_ON_MAIN_THREAD=0 -sPOLYFILL=0 --pre-js pre1.js --pre-js pre2.js --pre-js pre3.js -I. -I$LIBARCHIVE/include -I$VOSK/src -L$LIBARCHIVE/lib -larchive -L$ZSTD/lib -lzstd -L$KALDI/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$OPENFST/lib -l:libfst.a -l:libfstngram.a -L$CLAPACK_WASM -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$VOSK/src -l:vosk.a -lopfs.js -lembind -pthread -flto -o BrowserRecognizer.js
