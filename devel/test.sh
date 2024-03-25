# Build the js file into this directory

cd .. &&
SRC=$(realpath src) &&
KALDI=$(realpath kaldi) &&
VOSK=$(realpath vosk) &&
OPENFST=$(realpath openfst) &&
LIBARCHIVE=$(realpath libarchive) &&
CLAPACK_WASM=$(realpath clapack-wasm) &&

MAX_MEMORY=${MAX_MEMORY:-500mb} &&
MAX_THREADS=${MAX_THREADS:-1} &&
EMSDK=${EMSDK:-$(realpath emsdk)} &&

if [ ! -d $EMSDK ]; then
  echo "Invalid EMSDK path"
  exit 1
fi
if [ $MAX_THREADS -lt 1 ]; then
  echo "MAX_THREAD must be greater than or equal to 1" &&
  exit 1
fi
if ! [[ $MAX_MEMORY =~ ^[0-9]+([kmgt]b)?$ ]]; then
  echo "MAX_MEMORY valid suffixes are kb, mb, gb, tb, none (bytes)" &&
  exit 1
fi 

. $EMSDK/emsdk_env.sh &&

cd $SRC &&
MODE=1 && # 0: Ultra debug info, 1: Extremely optimized release, else custom
echo "Mode = $MODE" &&
if [ $MODE = 0 ]; then
  em++ -O0 link.cc genericModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sMODULARIZE -sEMBIND_STD_STRING_IS_UTF8 -sPTHREAD_POOL_DELAY_LOAD -sRUNTIME_DEBUG -sSTACK_OVERFLOW_CHECK=2 -sTEXTDECODER=2 -sPTHREAD_POOL_SIZE_STRICT=2 -sASSERTIONS=2 -sINITIAL_MEMORY=$MAX_MEMORY -sPTHREAD_POOL_SIZE=$MAX_THREADS -sDISABLE_EXCEPTION_CATCHING=0 -sEXIT_RUNTIME=0 -sINVOKE_RUN=0 -sPOLYFILL=0 -sEXPORTED_FUNCTIONS=_malloc -sEXPORT_NAME=loadVosklet -sMALLOC=emmalloc -sEXPORTED_RUNTIME_METHODS=UTF8ToString,stringToUTF8OnStack -sENVIRONMENT=web,worker -I. -I$LIBARCHIVE/include -I$VOSK/src -L$LIBARCHIVE/lib -larchive -L$KALDI/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$OPENFST/lib -l:libfst.a -l:libfstngram.a -L$CLAPACK_WASM -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$VOSK/src -l:vosk.a -lembind -pthread -flto -msimd128 --embind-emit-tsd Vosklet.d.ts -fsanitize=undefined -fsanitize=address -fsanitize=leak -msimd128 -mreference-types -mnontrapping-fptoint -mextended-const -msign-ext -g3 --pre-js pre.js -o ../devel/Vosklet.js 
elif [ $MODE = 1 ]; then
  em++ -O3 link.cc genericModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sMODULARIZE -sEMBIND_STD_STRING_IS_UTF8 -sPTHREAD_POOL_DELAY_LOAD -sTEXTDECODER=2 -sPTHREAD_POOL_SIZE_STRICT=2 -sINITIAL_MEMORY=$MAX_MEMORY -sPTHREAD_POOL_SIZE=$MAX_THREADS -sPOLYFILL=0 -sEXIT_RUNTIME=0 -sINVOKE_RUN=0 -sSUPPORT_LONGJMP=0 -sEXPORTED_FUNCTIONS=_malloc -sEXPORT_NAME=loadVosklet -sMALLOC=emmalloc -sEXPORTED_RUNTIME_METHODS=UTF8ToString,stringToUTF8OnStack -sENVIRONMENT=web,worker -I. -I$LIBARCHIVE/include -I$VOSK/src -L$LIBARCHIVE/lib -larchive -L$KALDI/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$OPENFST/lib -l:libfst.a -l:libfstngram.a -L$CLAPACK_WASM -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$VOSK/src -l:vosk.a -lembind -pthread -flto -msimd128 -mreference-types -mnontrapping-fptoint -mextended-const -msign-ext --pre-js pre.js -o ../devel/Vosklet.js
else
  em++ -O3 link.cc genericModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sMODULARIZE -sEMBIND_STD_STRING_IS_UTF8 -sPTHREAD_POOL_DELAY_LOAD -sTEXTDECODER=2 -sPTHREAD_POOL_SIZE_STRICT=2 -sINITIAL_MEMORY=$MAX_MEMORY -sPTHREAD_POOL_SIZE=$MAX_THREADS -sPOLYFILL=0 -sEXIT_RUNTIME=0 -sINVOKE_RUN=0 -sSUPPORT_LONGJMP=0 -sEXPORTED_FUNCTIONS=_malloc -sEXPORT_NAME=loadVosklet -sMALLOC=emmalloc -sEXPORTED_RUNTIME_METHODS=UTF8ToString,stringToUTF8OnStack -sENVIRONMENT=web,worker -I. -I$LIBARCHIVE/include -I$VOSK/src -L$LIBARCHIVE/lib -larchive -L$KALDI/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$OPENFST/lib -l:libfst.a -l:libfstngram.a -L$CLAPACK_WASM -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$VOSK/src -l:vosk.a -lembind -pthread -flto -msimd128 -mreference-types -mnontrapping-fptoint -mextended-const -msign-ext -g3 --pre-js pre.js -o ../devel/Vosklet.js
fi