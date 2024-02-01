cd .. &&
SRC=$(realpath src) &&
KALDI=$(realpath kaldi) &&
VOSK=$(realpath vosk-api) &&
OPENFST=$KALDI/tools/openfst &&
LIBARCHIVE=$(realpath libarchive) &&
ZSTD=$(realpath zstd) && 
CLAPACK_WASM=$(realpath clapack-wasm) &&

MAX_MEMORY=${MAX_MEMORY:-300mb} &&
MAX_THREADS=${MAX_THREADS:-2} &&
EMSDK=${EMSDK:-$(realpath ../emsdk)} &&

if [ ! -d $EMSDK_PATH ]; then
  echo "Invalid EMSDK path"
  exit 1
fi
if [ $MAX_THREAD -lt 2 ]; then
  echo "MAX_THREAD must be greater or equal to 2" &&
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
  ./emsdk install 3.1.53 &&
  ./emsdk activate 3.1.53 
fi

. $EMSDK/emsdk_env.sh &&
export PATH=:$PATH:$EMSDK/upstream/bin &&

cd $SRC &&
em++ -O0 global.cc genericModel.cc model.cc spkModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sEMBIND_STD_STRING_IS_UTF8 -sEXPORTED_RUNTIME_METHODS=UTF8ToString,stringToUTF8OnStack -sMODULARIZE -sEXPORTED_FUNCTIONS=_malloc,_free,_main -sSUPPORT_LONGJMP=0 -sTRUSTED_TYPES -sEXPORT_NAME=loadBR -sENVIRONMENT=web,worker -sINITIAL_MEMORY=$MAX_MEMORY -sPTHREAD_POOL_SIZE=$MAX_THREADS -sPTHREAD_POOL_SIZE_STRICT=0 -sEXIT_RUNTIME -sALLOW_BLOCKING_ON_MAIN_THREAD=1 -sPOLYFILL=0 -sPTHREAD_POOL_DELAY_LOAD --pre-js pre.js -I. -I$LIBARCHIVE/include -I$VOSK/src -L$LIBARCHIVE/lib -larchive -L$ZSTD/lib -lzstd -L$KALDI/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$OPENFST/lib -l:libfst.a -l:libfstngram.a -L$CLAPACK_WASM -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$VOSK/src -l:vosk.a -lopfs.js -lembind -pthread -flto -o ../test/BrowserRecognizer.js