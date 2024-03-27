  ####  ####  ####     ###   ####  #   #  ####  #      ####  ####  ####  ####  ####
  #     #  #  #  #     # ##  #     #   #  #     #      #  #  #  #  #     #  #  #
  ####  #  #  ####     #  #  ####   # #   ####  #      #  #  ####  ####  ####  ####
  #     #  #  # #      # ##  #      # #   #     #      #  #  #     #     # #      #
  #     ####  #  #     ###   ####    #    ####  #####  ####  #     ####  #  #  ####

# 20 min build time
SHELL=/bin/bash
MAX_MEMORY?=300mb 
MAX_THREADS?=2 
EMSDK?=../emsdk 
COMPILE_JOBS?:=$(nproc) 

SRC:=$(realpath src) 
KALDI:=$(realpath kaldi) 
VOSK:=$(realpath vosk) 
OPENFST:=$(realpath openfst)
LIBARCHIVE:=$(realpath libarchive) 
CLAPACK_WASM:=$(realpath clapack-wasm) 

Vosklet.js: | vosk libarchive
	cd $(SRC) && \
	em++ -O3 link.cc genericModel.cc recognizer.cc bindings.cc -sWASMFS -sWASM_BIGINT -sSINGLE_FILE -sMODULARIZE -sEMBIND_STD_STRING_IS_UTF8 -sPTHREAD_POOL_DELAY_LOAD -sTEXTDECODER=2 -sPTHREAD_POOL_SIZE_STRICT=2 -sINITIAL_MEMORY=$(MAX_MEMORY) -sPTHREAD_POOL_SIZE=$(MAX_THREADS) -sPOLYFILL=0 -sEXIT_RUNTIME=0 -sINVOKE_RUN=0 -sSUPPORT_LONGJMP=0 -sEXPORTED_FUNCTIONS=_malloc -sEXPORT_NAME=loadVosklet -sMALLOC=emmalloc -sEXPORTED_RUNTIME_METHODS=UTF8ToString,stringToUTF8OnStack -sENVIRONMENT=web,worker -I. -I$(LIBARCHIVE)/include -I$(VOSK)/src -L$(LIBARCHIVE)/lib -larchive -L$(KALDI)/src -l:online2/kaldi-online2.a -l:decoder/kaldi-decoder.a -l:ivector/kaldi-ivector.a -l:gmm/kaldi-gmm.a -l:tree/kaldi-tree.a -l:feat/kaldi-feat.a -l:cudamatrix/kaldi-cudamatrix.a -l:lat/kaldi-lat.a -l:lm/kaldi-lm.a -l:rnnlm/kaldi-rnnlm.a -l:hmm/kaldi-hmm.a -l:nnet3/kaldi-nnet3.a -l:transform/kaldi-transform.a -l:matrix/kaldi-matrix.a -l:fstext/kaldi-fstext.a -l:util/kaldi-util.a -l:base/kaldi-base.a -L$(OPENFST)/lib -l:libfst.a -l:libfstngram.a -L$(CLAPACK_WASM) -l:CBLAS/lib/cblas.a -l:CLAPACK-3.2.1/lapack.a -l:CLAPACK-3.2.1/libcblaswr.a -l:f2c_BLAS-3.8.0/blas.a -l:libf2c/libf2c.a -L$(VOSK)/src -l:vosk.a -lembind -pthread -flto -msimd128 -mreference-types -mnontrapping-fptoint -mextended-const -msign-ext --pre-js pre.js -o ../Vosklet.js && \
	cd .. && \
	rm -f Vosklet.worker.js && \

prepare:
	sudo apt install shtool libtool autogen autotools-dev pkg-config make && \
	[ $(EMSDK) != ../emsdk ! -d $(EMSDK) ] && \
		echo "Invalid emsdk path"; \
		exit 1; \
	[ $(MAX_THREADS) -lt 2 ] && \
		echo "MAX_THREADS must be greater than or equal to 2"; \
		exit 1; \
	[ $(COMPILE_JOBS) -lt 1 ] && \
		echo "COMPILE_JOBS must be greater than or equal to 1"; \
		exit 1; \
	[[ ! $(MAX_MEMORY) =~ "$(^[0-9]+([kmgt]b)?$$)" ]] && \
		echo "MAX_MEMORY valid suffixes are kb, mb, gb, tb, none (bytes)"; \
		exit 1; \
	[ $(EMSDK) = ../emsdk ] && \
		echo "Installing emsdk + Emscripten..."; \
		git clone --depth=1 https://github.com/emscripten-core/emsdk.git ../emsdk && \
		cd ../emsdk &&
		./emsdk install 3.1.56 && \
		./emsdk activate 3.1.56; \
		. ./emsdk_env.sh && \
		export PATH=:$$PATH:$(realpath $(EMSDK))/upstream/bin && \
		cd ../src

libarchive: prepare
	rm -rf /tmp/libarchive && \
	git clone -b v3.7.2 --depth=1 https://github.com/libarchive/libarchive /tmp/libarchive && \
	cd /tmp/libarchive && \
	build/autogen.sh && \
	CPPFLAGS="-O3 -flto -msimd128" LDFLAGS="-O3 -flto" emconfigure ./configure --prefix=$(LIBARCHIVE) --without-lz4 --without-lzma --without-zlib --without-bz2lib --without-xml2 --without-expat --without-cng --without-openssl --without-libb2 --without-zstd --disable-bsdunzip --disable-xattr --disable-acl --disable-bsdcpio --disable-bsdcat --disable-rpath --disable-maintainer-mode --disable-dependency-tracking --enable-static --disable-shared && \
	emmake make -j$(COMPILE_JOBS) install && \
	rm -rf /tmp/libarchive 

clapack-wasm: prepare
	git clone --depth=1 https://gitlab.inria.fr/multispeech/kaldi.web/clapack-wasm.git $(CLAPACK_WASM) && \
	cd $(CLAPACK_WASM) && \
	git apply $(SRC)/clapack-wasm.patch &&
	bash install_repo.sh emcc 

openfst: prepare
	rm -rf /tmp/openfst && \
	git clone --depth=1 https://github.com/alphacep/openfst /tmp/openfst && \
	cd /tmp/openfst && \
	autoreconf -i && \
	CXXFLAGS="-r -O3 -flto -msimd128" LDFLAGS="-O3 -flto" emconfigure ./configure --prefix=$(OPENFST) --enable-static --disable-shared --enable-lookahead-fsts --enable-ngram-fsts --disable-bin && \
	emmake make -j$(COMPILE_JOBS) install && \
	echo "PACKAGE_VERSION = 1.8.0" >> $(OPENFST)/Makefile && \
	rm -rf /tmp/openfst 
	
kaldi: | openfst clapack-wasm
	git clone -b vosk --depth=1 https://github.com/alphacep/kaldi && \
	cd $(KALDI)/src && \
	git apply $(SRC)/kaldi.patch && \
	CXXFLAGS="-O3 -UHAVE_EXECINFO_H -flto -msimd128 -Wno-unused-variable -Wno-unused-but-set-variable -g0" LDFLAGS="-O3 -lembind -flto -g0" emconfigure ./configure --use-cuda=no --with-cudadecoder=no --static --static-math=yes --static-fst=yes --debug-level=0 --fst-root=$(OPENFST) --clapack-root=$(CLAPACK_WASM) --host=WASM && \
	emmake make -j$(COMPILE_JOBS) online2 rnnlm

vosk: | kaldi
	git clone -b go/v0.3.46 --depth=1 https://github.com/alphacep/vosk-api $(VOSK) && \
	cd $(VOSK)/src && \
	git apply $(SRC)/vosk.patch && \
	VOSK_FILES="recognizer.cc language_model.cc model.cc spk_model.cc vosk_api.cc" && \
	em++ -O3 -flto -msimd128 -Wno-deprecated -I. -I$(KALDI)/src -I$(OPENFST)/include $(VOSK_FILES) -c && \
	emar -rcs vosk.a $(VOSK_FILES:.cc=.o)
	
.PHONY: prepare