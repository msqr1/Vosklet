// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
interface WasmModule {
  _pthread_self(): number;
  _malloc(_0: number): number;
  __emscripten_tls_init(): number;
  __embind_initialize_bindings(): void;
  __emscripten_thread_init(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number): void;
  __emscripten_thread_crashed(): void;
  __emscripten_thread_exit(_0: number): void;
  __ZN6__asan9FakeStack17AddrIsInFakeStackEm(_0: number, _1: number): number;
  __ZN6__asan9FakeStack8AllocateEmmm(_0: number, _1: number, _2: number, _3: number): number;
  ___set_stack_limits(_0: number, _1: number): void;
}

export interface epModeValue<T extends number> {
  value: T;
}
export type epMode = epModeValue<0>|epModeValue<1>|epModeValue<2>|epModeValue<3>;

export interface genericModel {
  extractAndLoad(_0: number, _1: number): void;
  delete(): void;
}

export interface recognizer {
  setSpkModel(_0: genericModel): void;
  acceptWaveForm(): void;
  setWords(_0: boolean): void;
  setPartialWords(_0: boolean): void;
  setNLSML(_0: boolean): void;
  setMaxAlternatives(_0: number): void;
  setGrm(_0: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): void;
  delete(): void;
}

interface EmbindModule {
  epMode: {ANSWER_DEFAULT: epModeValue<0>, ANSWER_SHORT: epModeValue<1>, ANSWER_LONG: epModeValue<2>, ANSWER_VERY_LONG: epModeValue<3>};
  genericModel: {new(_0: number, _1: boolean, _2: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _3: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string): genericModel};
  recognizer: {new(_0: number, _1: number, _2: genericModel): recognizer; new(_0: number, _1: number, _2: genericModel, _3: genericModel): recognizer; new(_0: number, _1: number, _2: genericModel, _3: ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string, _4: number): recognizer};
  setLogLevel(_0: number): void;
}
export type MainModule = WasmModule & EmbindModule;
