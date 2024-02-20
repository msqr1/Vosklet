# Build the js file into this directory or the outer for release mode

cd .. &&
SRC=$(realpath src) &&
KALDI=$(realpath kaldi) &&
VOSK=$(realpath vosk) &&
OPENFST=$(realpath openfst) &&
LIBARCHIVE=$(realpath libarchive) &&
CLAPACK_WASM=$(realpath clapack-wasm) &&
RELEASE=0 &&

MAX_MEMORY=${MAX_MEMORY:-300mb} &&
MAX_THREADS=${MAX_THREADS:-2} &&
EMSDK=${EMSDK:-$(realpath ../emsdk)} &&

if [ ! -d $EMSDK_PATH ]; then
  echo "Invalid EMSDK path"
  exit 1
fi
if [ $MAX_THREADS -lt 2 ]; then
  echo "MAX_THREAD must be greater or equal to 2" &&
  exit 1
fi
if ! [[ $MAX_MEMORY =~ ^[0-9]+([kmgt]b)?$ ]]; then
  echo "MAX_MEMORY valid suffixes are kb, mb, gb, tb, none (bytes)" &&
  exit 1
fi 
if [ $EMSDK = ../emsdk ]; then
  echo "EMSDK is current directory, installing emsdk and Emscripten..." &&
  git clone --depth=1 https://github.com/emscripten-core/emsdk.git &&
  cd emsdk &&
  ./emsdk install 3.1.54 &&
  ./emsdk activate 3.1.54 
fi

. $EMSDK/emsdk_env.sh &&
export PATH=:$PATH:$EMSDK/upstream/bin &&

cd $SRC &&
if [ $RELEASE = 0 ]; then
  em++ -O0 global.cc genericModel.cc model.cc spkModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sMODULARIZE -sASSERTIONS=2 -sEMBIND_STD_STRING_IS_UTF8 -sPTHREAD_POOL_DELAY_LOAD -sTEXTDECODER=2 -sPTHREAD_POOL_SIZE_STRICT=2 -sINITIAL_MEMORY=$MAX_MEMORY  -sPTHREAD_POOL_SIZE=$MAX_THREADS -sPOLYFILL=0 -sSUPPORT_LONGJMP=0 -sEXPORTED_FUNCTIONS=_malloc -sEXPORT_NAME=loadBR -sMALLOC=emmalloc -sEXPORTED_RUNTIME_METHODS=UTF8ToString,stringToUTF8OnStack -sENVIRONMENT=web,worker -I. -I$LIBARCHIVE/include -I$VOSK/src -L$LIBARCHIVE/lib -larchive -L$KALDI/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$OPENFST/lib -l:libfst.a -l:libfstngram.a -L$CLAPACK_WASM -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$VOSK/src -l:vosk.a -lopfs.js -lembind -pthread -flto -msimd128 --no-entry --emit-symbol-map --pre-js pre.js  -o ../devel/BrowserRecognizer.js &&
else
  em++ -O3 global.cc genericModel.cc model.cc spkModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sMODULARIZE -sEMBIND_STD_STRING_IS_UTF8 -sPTHREAD_POOL_DELAY_LOAD -sTEXTDECODER=2 -sPTHREAD_POOL_SIZE_STRICT=2 -sINITIAL_MEMORY=$MAX_MEMORY -sPTHREAD_POOL_SIZE=$MAX_THREADS -sPOLYFILL=0 -sSUPPORT_LONGJMP=0 -sEXPORTED_FUNCTIONS=_malloc -sEXPORT_NAME=loadBR -sMALLOC=emmalloc -sEXPORTED_RUNTIME_METHODS=UTF8ToString,stringToUTF8OnStack -sENVIRONMENT=web,worker -I. -I$LIBARCHIVE/include -I$VOSK/src -L$LIBARCHIVE/lib -larchive -L$KALDI/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$OPENFST/lib -l:libfst.a -l:libfstngram.a -L$CLAPACK_WASM -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$VOSK/src -l:vosk.a -lopfs.js -lembind -pthread -flto -msimd128 --no-entry --pre-js pre.js -o ../devel/BrowserRecognizer.js &&
fi
