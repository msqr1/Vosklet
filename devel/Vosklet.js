
var loadVosklet = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(moduleArg = {}) {

var Module = moduleArg;

var readyPromiseResolve, readyPromiseReject;

Module["ready"] = new Promise((resolve, reject) => {
 readyPromiseResolve = resolve;
 readyPromiseReject = reject;
});

[ "_malloc", "__emscripten_thread_init", "__emscripten_thread_exit", "__emscripten_thread_crashed", "__emscripten_thread_mailbox_await", "__emscripten_tls_init", "_pthread_self", "checkMailbox", "__embind_initialize_bindings", "establishStackSpace", "invokeEntryPoint", "PThread", "___indirect_function_table", "___set_stack_limits", "onRuntimeInitialized" ].forEach(prop => {
 if (!Object.getOwnPropertyDescriptor(Module["ready"], prop)) {
  Object.defineProperty(Module["ready"], prop, {
   get: () => abort("You are getting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),
   set: () => abort("You are setting " + prop + " on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")
  });
 }
});

let objs = [];

let dStream = new DecompressionStream("gzip");

Module.cleanUp = () => {
 objs.forEach(obj => obj.delete());
 URL.revokeObjectURL(pthreadUrl);
 URL.revokeObjectURL(processorUrl);
};

Module.locateFile = (path, scriptDir) => {
 if (path === "Vosklet.js") return pthreadUrl;
 return scriptDir + path;
};

class genericModel extends EventTarget {
 constructor() {
  super();
  objs.push(this);
 }
 static async _init(url, storepath, id, normalMdl) {
  let mdl = new genericModel;
  return new Promise((resolve, reject) => {
   mdl.addEventListener("_continue", ev => {
    if (ev.detail === "0") {
     return resolve(mdl);
    }
    mdl.delete();
    reject(ev.detail);
   }, {
    once: true
   });
   mdl.addEventListener("_checkMdl", async ev => {
    switch (ev.detail) {
    case "0":
     mdl.load(true);
     break;

    case "fetch":
     let res = await fetch(url);
     if (!res.ok) {
      return reject("Unable to download model");
     }
     let wStream = await (await (await navigator.storage.getDirectory()).getFileHandle("m0dEl.tar", {
      create: true
     })).createWritable();
     let tarReader = res.body.pipeThrough(dStream).getReader();
     while (true) {
      let readRes = await tarReader.read();
      if (!readRes.done) await wStream.write(readRes.value); else break;
     }
     await wStream.close();
     mdl.obj.afterFetch();
     break;

    default:
     reject(ev.detail);
    }
   }, {
    once: true
   });
   mdl.obj = new Module.genericModel(storepath, id, objs.length - 1, normalMdl);
   mdl.obj.check();
  });
 }
 delete() {
  if (this.obj) this.obj.delete();
 }
}

Module.makeModel = async (url, storepath, id) => genericModel._init(url, storepath, id, true);

Module.makeSpkModel = async (url, storepath, id) => genericModel._init(url, storepath, id, false);

class Recognizer extends EventTarget {
 constructor() {
  super();
  objs.push(this);
 }
 static async _init1(model, sampleRate) {
  let rec = new Recognizer;
  return new Promise((resolve, reject) => {
   rec.addEventListener("_continue", ev => {
    if (ev.detail == "0") {
     rec.ptr = Module._malloc(512);
     return resolve(rec);
    }
    rec.delete();
    reject(ev.detail);
   }, {
    once: true
   });
   rec.obj = new Module.recognizer(model, sampleRate, objs.length - 1);
  });
 }
 static async _init2(model, spkModel, sampleRate) {
  let rec = new Recognizer;
  return new Promise((resolve, reject) => {
   rec.addEventListener("_continue", ev => {
    if (ev.detail == "0") {
     rec.ptr = Module._malloc(512);
     return resolve(rec);
    }
    rec.delete();
    reject(ev.detail);
   }, {
    once: true
   });
   rec.obj = new Module.recognizer(model, spkModel, sampleRate, objs.length - 1);
  });
 }
 static async _init3(model, grammar, sampleRate) {
  let rec = new Recognizer;
  return new Promise((resolve, reject) => {
   rec.addEventListener("_continue", ev => {
    if (ev.detail == "0") {
     rec.ptr = Module._malloc(512);
     return resolve(rec);
    }
    rec.delete();
    reject(ev.detail);
   }, {
    once: true
   });
   rec.obj = new Module.recognizer(model, grammar, sampleRate, objs.length - 1, 0);
  });
 }
 async getNode(ctx, channelIndex = 0) {
  if (typeof this.node === "undefined") {
   let msgChannel = new MessageChannel;
   await ctx.audioWorklet.addModule(processorUrl);
   this.node = new AudioWorkletNode(ctx, "BRProcessor", {
    channelCountMode: "max",
    numberOfInputs: 1,
    numberOfOutputs: 1,
    processorOptions: {
     ptr: this.ptr,
     channel: channelIndex,
     recognizerPort: msgChannel.port1
    }
   });
   msgChannel.port1.onmessage = () => {
    this.obj.acceptWaveForm();
   };
  }
  return this.node;
 }
 recognize(buf, channelIndex = 0) {
  Module.HEAPF32.set(buf.getChannelData(channelIndex).subarray(0, 512), this.ptr);
  this.obj.acceptWaveForm();
 }
 delete() {
  if (this.obj) this.obj.delete();
  if (this.node) this.node.postMessage(0);
 }
 setWords(words) {
  this.obj.setWords(words);
 }
 setPartialWords(partialWords) {
  this.obj.setPartialWords(partialWords);
 }
 setGrm(grm) {
  this.obj.setGrm(grm);
 }
 setSpkModel(spkModel) {
  this.obj.setSpkModel(spkModel.obj);
 }
 setNLSML(nlsml) {
  this.obj.setNLSML(nlsml);
 }
 setMaxAlternatives(alts) {
  this.obj.setMaxAlternatives(alts);
 }
}

Module.makeRecognizer = (model, sampleRate) => Recognizer._init(model.obj, sampleRate);

Module.makeRecognizerWithSpkModel = (model, spkModel, sampleRate) => Recognizer._init2(model.obj, spkModel.obj, sampleRate);

Module.makeRecognizerWithGrm = (model, grammar, sampleRate) => Recognizer._init3(model.obj, grammar, sampleRate);

let processorUrl = URL.createObjectURL(new Blob([ "(", (() => {
 registerProcessor("BRProcessor", class extends AudioWorkletProcessor {
  constructor(options) {
   this.done = false;
   this.port.onmessage = ev => this.done = true;
   this.ptr = options.processorOptions.ptr;
   this.recognizerPort = options.processorOptions.recognizerPort;
   this.channelIndex = options.processorOptions.channelIndex;
  }
  process(inputs, outputs, params) {
   if (this.done) return false;
   this.wasmMem.set(inputs[0].getChannelData(this.channelIndex));
   this.recognizerPort.postMessage("0");
   outputs = inputs;
   return true;
  }
 });
}).toString(), ")()" ], {
 type: "text/javascript"
}));

let pthreadUrl = URL.createObjectURL(new Blob([ "(", (() => {
 "use strict";
 var Module = {};
 var initializedJS = false;
 function assert(condition, text) {
  if (!condition) abort("Assertion failed: " + text);
 }
 function threadPrintErr(...args) {
  var text = args.join(" ");
  console.error(text);
 }
 function threadAlert(...args) {
  var text = args.join(" ");
  postMessage({
   cmd: "alert",
   text: text,
   threadId: Module["_pthread_self"]()
  });
 }
 var out = () => {
  throw "out() is not defined in worker.js.";
 };
 var err = threadPrintErr;
 self.alert = threadAlert;
 var dbg = threadPrintErr;
 Module["instantiateWasm"] = (info, receiveInstance) => {
  var module = Module["wasmModule"];
  Module["wasmModule"] = null;
  var instance = new WebAssembly.Instance(module, info);
  return receiveInstance(instance);
 };
 self.onunhandledrejection = e => {
  throw e.reason || e;
 };
 function handleMessage(e) {
  try {
   if (e.data.cmd === "load") {
    let messageQueue = [];
    self.onmessage = e => messageQueue.push(e);
    self.startWorker = instance => {
     Module = instance;
     postMessage({
      "cmd": "loaded"
     });
     for (let msg of messageQueue) {
      handleMessage(msg);
     }
     self.onmessage = handleMessage;
    };
    Module["wasmModule"] = e.data.wasmModule;
    for (const handler of e.data.handlers) {
     Module[handler] = (...args) => {
      postMessage({
       cmd: "callHandler",
       handler: handler,
       args: args
      });
     };
    }
    Module["wasmMemory"] = e.data.wasmMemory;
    Module["buffer"] = Module["wasmMemory"].buffer;
    Module["workerID"] = e.data.workerID;
    Module["ENVIRONMENT_IS_PTHREAD"] = true;
    if (typeof e.data.urlOrBlob == "string") {
     importScripts(e.data.urlOrBlob);
    } else {
     var objectUrl = URL.createObjectURL(e.data.urlOrBlob);
     importScripts(objectUrl);
     URL.revokeObjectURL(objectUrl);
    }
    loadBR(Module);
   } else if (e.data.cmd === "run") {
    Module["__emscripten_thread_init"](e.data.pthread_ptr, /*is_main=*/ 0, /*is_runtime=*/ 0, /*can_block=*/ 1);
    Module["__emscripten_thread_mailbox_await"](e.data.pthread_ptr);
    assert(e.data.pthread_ptr);
    Module["establishStackSpace"]();
    Module["PThread"].receiveObjectTransfer(e.data);
    Module["PThread"].threadInitTLS();
    if (!initializedJS) {
     Module["__embind_initialize_bindings"]();
     initializedJS = true;
    }
    try {
     Module["invokeEntryPoint"](e.data.start_routine, e.data.arg);
    } catch (ex) {
     if (ex != "unwind") {
      throw ex;
     }
    }
   } else if (e.data.cmd === "cancel") {
    if (Module["_pthread_self"]()) {
     Module["__emscripten_thread_exit"](-1);
    }
   } else if (e.data.target === "setimmediate") {} else  if (e.data.cmd === "checkMailbox") {
    if (initializedJS) {
     Module["checkMailbox"]();
    }
   } else if (e.data.cmd) {
    err(`worker.js received unknown command ${e.data.cmd}`);
    err(e.data);
   }
  } catch (ex) {
   err(`worker.js onmessage() captured an uncaught exception: ${ex}`);
   if (ex?.stack) err(ex.stack);
   Module["__emscripten_thread_crashed"]?.();
   throw ex;
  }
 }
 self.onmessage = handleMessage;
}).toString(), ")()" ], {
 type: "text/javascript"
}));

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module["ENVIRONMENT"]) {
 throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
}

var ENVIRONMENT_IS_PTHREAD = Module["ENVIRONMENT_IS_PTHREAD"] || false;

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary;

if (ENVIRONMENT_IS_SHELL) {
 if ((typeof process == "object" && typeof require === "function") || typeof window == "object" || typeof importScripts == "function") throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 if (typeof read != "undefined") {
  read_ = read;
 }
 readBinary = f => {
  if (typeof readbuffer == "function") {
   return new Uint8Array(readbuffer(f));
  }
  let data = read(f, "binary");
  assert(typeof data == "object");
  return data;
 };
 readAsync = (f, onload, onerror) => {
  setTimeout(() => onload(readBinary(f)));
 };
 if (typeof clearTimeout == "undefined") {
  globalThis.clearTimeout = id => {};
 }
 if (typeof setTimeout == "undefined") {
  globalThis.setTimeout = f => (typeof f == "function") ? f() : abort();
 }
 if (typeof scriptArgs != "undefined") {
  arguments_ = scriptArgs;
 } else if (typeof arguments != "undefined") {
  arguments_ = arguments;
 }
 if (typeof quit == "function") {
  quit_ = (status, toThrow) => {
   setTimeout(() => {
    if (!(toThrow instanceof ExitStatus)) {
     let toLog = toThrow;
     if (toThrow && typeof toThrow == "object" && toThrow.stack) {
      toLog = [ toThrow, toThrow.stack ];
     }
     err(`exiting due to exception: ${toLog}`);
    }
    quit(status);
   });
   throw toThrow;
  };
 }
 if (typeof print != "undefined") {
  if (typeof console == "undefined") console = /** @type{!Console} */ ({});
  console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
  console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr != "undefined" ? printErr : print);
 }
} else  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document != "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (_scriptDir) {
  scriptDirectory = _scriptDir;
 }
 if (scriptDirectory.startsWith("blob:")) {
  scriptDirectory = "";
 } else {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 }
 if (!(typeof window == "object" || typeof importScripts == "function")) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
 {
  read_ = url => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, false);
   xhr.send(null);
   return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = url => {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
    return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
   };
  }
  readAsync = (url, onload, onerror) => {
   var xhr = new XMLHttpRequest;
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = () => {
    if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
     onload(xhr.response);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
} else  {
 throw new Error("environment detection error");
}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.error.bind(console);

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

checkIncomingModuleAPI();

if (Module["arguments"]) arguments_ = Module["arguments"];

legacyModuleProp("arguments", "arguments_");

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

legacyModuleProp("thisProgram", "thisProgram");

if (Module["quit"]) quit_ = Module["quit"];

legacyModuleProp("quit", "quit_");

assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");

assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");

assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");

assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");

assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");

assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");

legacyModuleProp("asm", "wasmExports");

legacyModuleProp("read", "read_");

legacyModuleProp("readAsync", "readAsync");

legacyModuleProp("readBinary", "readBinary");

legacyModuleProp("setWindowTitle", "setWindowTitle");

var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";

var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";

var WORKERFS = "WORKERFS is no longer included by default; build with -lworkerfs.js";

var FETCHFS = "FETCHFS is no longer included by default; build with -lfetchfs.js";

var ICASEFS = "ICASEFS is no longer included by default; build with -licasefs.js";

var JSFILEFS = "JSFILEFS is no longer included by default; build with -ljsfilefs.js";

var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";

assert(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE, "Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)");

assert(!ENVIRONMENT_IS_NODE, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");

assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

legacyModuleProp("wasmBinary", "wasmBinary");

if (typeof WebAssembly != "object") {
 abort("no native wasm support detected");
}

/** @param {number|boolean=} isFloat */ function getSafeHeapType(bytes, isFloat) {
 switch (bytes) {
 case 1:
  return "i8";

 case 2:
  return "i16";

 case 4:
  return isFloat ? "float" : "i32";

 case 8:
  return isFloat ? "double" : "i64";

 default:
  abort(`getSafeHeapType() invalid bytes=${bytes}`);
 }
}

var SAFE_HEAP_COUNTER = 0;

/** @param {number|boolean=} isFloat */ function SAFE_HEAP_STORE(dest, value, bytes, isFloat) {
 dbg("SAFE_HEAP store: " + [ dest, value, bytes, isFloat, SAFE_HEAP_COUNTER++ ]);
 if (dest <= 0) abort(`segmentation fault storing ${bytes} bytes to address ${dest}`);
 if (dest % bytes !== 0) abort(`alignment error storing to address ${dest}, which was expected to be aligned to a multiple of ${bytes}`);
 if (runtimeInitialized) {
  var brk = _sbrk(0);
  if (dest + bytes > brk) abort(`segmentation fault, exceeded the top of the available dynamic heap when storing ${bytes} bytes to address ${dest}. DYNAMICTOP=${brk}`);
  if (brk < _emscripten_stack_get_base()) abort(`brk >= _emscripten_stack_get_base() (brk=${brk}, _emscripten_stack_get_base()=${_emscripten_stack_get_base()})`);
  if (brk > wasmMemory.buffer.byteLength) abort(`brk <= wasmMemory.buffer.byteLength (brk=${brk}, wasmMemory.buffer.byteLength=${wasmMemory.buffer.byteLength})`);
 }
 setValue_safe(dest, value, getSafeHeapType(bytes, isFloat));
 return value;
}

function SAFE_HEAP_STORE_D(dest, value, bytes) {
 return SAFE_HEAP_STORE(dest, value, bytes, true);
}

/** @param {number|boolean=} isFloat */ function SAFE_HEAP_LOAD(dest, bytes, unsigned, isFloat) {
 if (dest <= 0) abort(`segmentation fault loading ${bytes} bytes from address ${dest}`);
 if (dest % bytes !== 0) abort(`alignment error loading from address ${dest}, which was expected to be aligned to a multiple of ${bytes}`);
 if (runtimeInitialized) {
  var brk = _sbrk(0);
  if (dest + bytes > brk) abort(`segmentation fault, exceeded the top of the available dynamic heap when loading ${bytes} bytes from address ${dest}. DYNAMICTOP=${brk}`);
  if (brk < _emscripten_stack_get_base()) abort(`brk >= _emscripten_stack_get_base() (brk=${brk}, _emscripten_stack_get_base()=${_emscripten_stack_get_base()})`);
  if (brk > wasmMemory.buffer.byteLength) abort(`brk <= wasmMemory.buffer.byteLength (brk=${brk}, wasmMemory.buffer.byteLength=${wasmMemory.buffer.byteLength})`);
 }
 var type = getSafeHeapType(bytes, isFloat);
 var ret = getValue_safe(dest, type);
 if (unsigned) ret = unSign(ret, parseInt(type.substr(1), 10));
 dbg("SAFE_HEAP load: " + [ dest, ret, bytes, isFloat, unsigned, SAFE_HEAP_COUNTER++ ]);
 return ret;
}

function SAFE_HEAP_LOAD_D(dest, bytes, unsigned) {
 return SAFE_HEAP_LOAD(dest, bytes, unsigned, true);
}

function SAFE_FT_MASK(value, mask) {
 var ret = value & mask;
 if (ret !== value) {
  abort(`Function table mask error: function pointer is ${value} which is masked by ${mask}, the likely cause of this is that the function pointer is being called by the wrong type.`);
 }
 return ret;
}

function segfault() {
 abort("segmentation fault");
}

function alignfault() {
 abort("alignment fault");
}

function intArrayFromBase64(s) {
 var decoded = atob(s);
 var bytes = new Uint8Array(decoded.length);
 for (var i = 0; i < decoded.length; ++i) {
  bytes[i] = decoded.charCodeAt(i);
 }
 return bytes;
}

function tryParseAsDataURI(filename) {
 if (isDataURI(filename)) {
  return new Response(new Blob([ intArrayFromBase64(filename.slice(dataURIPrefix.length)) ]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
 }
}

var wasmMemory;

var wasmModule;

var ABORT = false;

var EXITSTATUS;

/** @type {function(*, string=)} */ function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed" + (text ? ": " + text : ""));
 }
}

var HEAP, /** @type {!Int8Array} */ HEAP8, /** @type {!Uint8Array} */ HEAPU8, /** @type {!Int16Array} */ HEAP16, /** @type {!Uint16Array} */ HEAPU16, /** @type {!Int32Array} */ HEAP32, /** @type {!Uint32Array} */ HEAPU32, /** @type {!Float32Array} */ HEAPF32, /* BigInt64Array type is not correctly defined in closure
/** not-@type {!BigInt64Array} */ HEAP64, /* BigUInt64Array type is not correctly defined in closure
/** not-t@type {!BigUint64Array} */ HEAPU64, /** @type {!Float64Array} */ HEAPF64;

function updateMemoryViews() {
 var b = wasmMemory.buffer;
 Module["HEAP8"] = HEAP8 = new Int8Array(b);
 Module["HEAP16"] = HEAP16 = new Int16Array(b);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
 Module["HEAP32"] = HEAP32 = new Int32Array(b);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
 Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
 Module["HEAPU64"] = HEAPU64 = new BigUint64Array(b);
}

assert(!Module["STACK_SIZE"], "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");

assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");

var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 314572800;

legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");

assert(INITIAL_MEMORY >= 65536, "INITIAL_MEMORY should be larger than STACK_SIZE, was " + INITIAL_MEMORY + "! (STACK_SIZE=" + 65536 + ")");

if (ENVIRONMENT_IS_PTHREAD) {
 wasmMemory = Module["wasmMemory"];
} else {
 if (Module["wasmMemory"]) {
  wasmMemory = Module["wasmMemory"];
 } else {
  wasmMemory = new WebAssembly.Memory({
   "initial": INITIAL_MEMORY / 65536,
   "maximum": INITIAL_MEMORY / 65536,
   "shared": true
  });
  if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
   err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
   if (ENVIRONMENT_IS_NODE) {
    err("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)");
   }
   throw Error("bad memory");
  }
 }
}

updateMemoryViews();

INITIAL_MEMORY = wasmMemory.buffer.byteLength;

assert(INITIAL_MEMORY % 65536 === 0);

function writeStackCookie() {
 var max = _emscripten_stack_get_end();
 dbg(`writeStackCookie: ${ptrToString(max)}`);
 assert((max & 3) == 0);
 if (max == 0) {
  max += 4;
 }
 SAFE_HEAP_STORE(((max) >> 2) * 4, 34821223, 4);
 checkInt32(34821223);
 SAFE_HEAP_STORE((((max) + (4)) >> 2) * 4, 2310721022, 4);
 checkInt32(2310721022);
}

function checkStackCookie() {
 if (ABORT) return;
 var max = _emscripten_stack_get_end();
 dbg(`checkStackCookie: ${ptrToString(max)}`);
 if (max == 0) {
  max += 4;
 }
 var cookie1 = SAFE_HEAP_LOAD(((max) >> 2) * 4, 4, 1);
 var cookie2 = SAFE_HEAP_LOAD((((max) + (4)) >> 2) * 4, 4, 1);
 if (cookie1 != 34821223 || cookie2 != 2310721022) {
  abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
 }
}

(function() {
 var h16 = new Int16Array(1);
 var h8 = new Int8Array(h16.buffer);
 h16[0] = 25459;
 if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
})();

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

function preRun() {
 assert(!ENVIRONMENT_IS_PTHREAD);
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 dbg("initRuntime");
 assert(!runtimeInitialized);
 runtimeInitialized = true;
 if (ENVIRONMENT_IS_PTHREAD) return;
 checkStackCookie();
 setStackLimits();
 callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
 checkStackCookie();
 if (ENVIRONMENT_IS_PTHREAD) return;
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnExit(cb) {}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

var runDependencyTracking = {};

function getUniqueRunDependency(id) {
 var orig = id;
 while (1) {
  if (!runDependencyTracking[id]) return id;
  id = orig + Math.random();
 }
}

function addRunDependency(id) {
 runDependencies++;
 Module["monitorRunDependencies"]?.(runDependencies);
 if (id) {
  assert(!runDependencyTracking[id]);
  runDependencyTracking[id] = 1;
  if (runDependencyWatcher === null && typeof setInterval != "undefined") {
   runDependencyWatcher = setInterval(() => {
    if (ABORT) {
     clearInterval(runDependencyWatcher);
     runDependencyWatcher = null;
     return;
    }
    var shown = false;
    for (var dep in runDependencyTracking) {
     if (!shown) {
      shown = true;
      err("still waiting on run dependencies:");
     }
     err(`dependency: ${dep}`);
    }
    if (shown) {
     err("(end of list)");
    }
   }, 1e4);
  }
 } else {
  err("warning: run dependency added without ID");
 }
}

function removeRunDependency(id) {
 runDependencies--;
 Module["monitorRunDependencies"]?.(runDependencies);
 if (id) {
  assert(runDependencyTracking[id]);
  delete runDependencyTracking[id];
 } else {
  err("warning: run dependency removed without ID");
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

/** @param {string|number=} what */ function abort(what) {
 Module["onAbort"]?.(what);
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
 readyPromiseReject(e);
 throw e;
}

var FS = {
 error() {
  abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
 },
 init() {
  FS.error();
 },
 createDataFile() {
  FS.error();
 },
 createPreloadedFile() {
  FS.error();
 },
 createLazyFile() {
  FS.error();
 },
 open() {
  FS.error();
 },
 mkdev() {
  FS.error();
 },
 registerDevice() {
  FS.error();
 },
 analyzePath() {
  FS.error();
 },
 ErrnoError() {
  FS.error();
 }
};

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

var dataURIPrefix = "data:application/octet-stream;base64,";

/**
 * Indicates whether filename is a base64 data URI.
 * @noinline
 */ var isDataURI = filename => filename.startsWith(dataURIPrefix);

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

function createExportWrapper(name) {
 return (...args) => {
  assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
  var f = wasmExports[name];
  assert(f, `exported native function \`${name}\` not found`);
  return f(...args);
 };
}

var wasmBinaryFile;


if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinarySync(file) {
 if (file == wasmBinaryFile && wasmBinary) {
  return new Uint8Array(wasmBinary);
 }
 var binary = tryParseAsDataURI(file);
 if (binary) {
  return binary;
 }
 if (readBinary) {
  return readBinary(file);
 }
 throw "both async and sync fetching of the wasm failed";
}

function getBinaryPromise(binaryFile) {
 return Promise.resolve().then(() => getBinarySync(binaryFile));
}

var wasmOffsetConverter;

/** @constructor */ function WasmOffsetConverter(wasmBytes, wasmModule) {
 var offset = 8;
 var funcidx = 0;
 this.offset_map = {};
 this.func_starts = [];
 this.name_map = {};
 this.import_functions = 0;
 var buffer = wasmBytes;
 function unsignedLEB128() {
  var result = 0;
  var shift = 0;
  do {
   var byte = buffer[offset++];
   result += (byte & 127) << shift;
   shift += 7;
  } while (byte & 128);
  return result;
 }
 function skipLimits() {
  var flags = unsignedLEB128();
  unsignedLEB128();
  var hasMax = (flags & 1) != 0;
  if (hasMax) {
   unsignedLEB128();
  }
 }
 binary_parse: while (offset < buffer.length) {
  var start = offset;
  var type = buffer[offset++];
  var end = unsignedLEB128() + offset;
  switch (type) {
  case 2:
   var count = unsignedLEB128();
   while (count-- > 0) {
    offset = unsignedLEB128() + offset;
    offset = unsignedLEB128() + offset;
    var kind = buffer[offset++];
    switch (kind) {
    case 0:
     ++funcidx;
     unsignedLEB128();
     break;

    case 1:
     unsignedLEB128();
     skipLimits();
     break;

    case 2:
     skipLimits();
     break;

    case 3:
     offset += 2;
     break;

    case 4:
     ++offset;
     unsignedLEB128();
     break;

    default:
     throw "bad import kind: " + kind;
    }
   }
   this.import_functions = funcidx;
   break;

  case 10:
   var count = unsignedLEB128();
   while (count-- > 0) {
    var size = unsignedLEB128();
    this.offset_map[funcidx++] = offset;
    this.func_starts.push(offset);
    offset += size;
   }
   break binary_parse;
  }
  offset = end;
 }
 var sections = WebAssembly.Module.customSections(wasmModule, "name");
 var nameSection = sections.length ? sections[0] : undefined;
 if (nameSection) {
  buffer = new Uint8Array(nameSection);
  offset = 0;
  while (offset < buffer.length) {
   var subsection_type = buffer[offset++];
   var len = unsignedLEB128();
   if (subsection_type != 1) {
    offset += len;
    continue;
   }
   var count = unsignedLEB128();
   while (count-- > 0) {
    var index = unsignedLEB128();
    var length = unsignedLEB128();
    this.name_map[index] = UTF8ArrayToString(buffer, offset, length);
    offset += length;
   }
  }
 }
}

WasmOffsetConverter.prototype.convert = function(funcidx, offset) {
 return this.offset_map[funcidx] + offset;
};

WasmOffsetConverter.prototype.getIndex = function(offset) {
 var lo = 0;
 var hi = this.func_starts.length;
 var mid;
 while (lo < hi) {
  mid = Math.floor((lo + hi) / 2);
  if (this.func_starts[mid] > offset) {
   hi = mid;
  } else {
   lo = mid + 1;
  }
 }
 return lo + this.import_functions - 1;
};

WasmOffsetConverter.prototype.isSameFunc = function(offset1, offset2) {
 return this.getIndex(offset1) == this.getIndex(offset2);
};

WasmOffsetConverter.prototype.getName = function(offset) {
 var index = this.getIndex(offset);
 return this.name_map[index] || ("wasm-function[" + index + "]");
};

function resetPrototype(constructor, attrs) {
 var object = Object.create(constructor.prototype);
 return Object.assign(object, attrs);
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
 var savedBinary;
 return getBinaryPromise(binaryFile).then(binary => {
  savedBinary = binary;
  return WebAssembly.instantiate(binary, imports);
 }).then(instance => {
  wasmOffsetConverter = new WasmOffsetConverter(savedBinary, instance.module);
  return instance;
 }).then(receiver, reason => {
  err(`failed to asynchronously prepare wasm: ${reason}`);
  if (isFileURI(wasmBinaryFile)) {
   err(`warning: Loading from a file URI (${wasmBinaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
  }
  abort(reason);
 });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
 return instantiateArrayBuffer(binaryFile, imports, callback);
}

function createWasm() {
 var info = {
  "env": wasmImports,
  "wasi_snapshot_preview1": wasmImports
 };
 /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
  wasmExports = instance.exports;
  registerTLSInit(wasmExports["_emscripten_tls_init"]);
  wasmTable = wasmExports["__indirect_function_table"];
  assert(wasmTable, "table not found in wasm exports");
  addOnInit(wasmExports["__wasm_call_ctors"]);
  wasmModule = module;
  removeRunDependency("wasm-instantiate");
  return wasmExports;
 }
 addRunDependency("wasm-instantiate");
 var trueModule = Module;
 function receiveInstantiationResult(result) {
  assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  trueModule = null;
  receiveInstance(result["instance"], result["module"]);
 }
 if (Module["instantiateWasm"]) {
  if (ENVIRONMENT_IS_PTHREAD) {
   assert(Module["wasmOffsetData"], "wasmOffsetData not found on Module object");
  }
  if (ENVIRONMENT_IS_PTHREAD) {
   wasmOffsetConverter = resetPrototype(WasmOffsetConverter, Module["wasmOffsetData"]);
  }
  try {
   return Module["instantiateWasm"](info, receiveInstance);
  } catch (e) {
   err(`Module.instantiateWasm callback failed with error: ${e}`);
   readyPromiseReject(e);
  }
 }
 dbg("asynchronously preparing wasm");
 instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
 return {};
}

function legacyModuleProp(prop, newName, incoming = true) {
 if (!Object.getOwnPropertyDescriptor(Module, prop)) {
  Object.defineProperty(Module, prop, {
   configurable: true,
   get() {
    let extra = incoming ? " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)" : "";
    abort(`\`Module.${prop}\` has been replaced by \`${newName}\`` + extra);
   }
  });
 }
}

function ignoredModuleProp(prop) {
 if (Object.getOwnPropertyDescriptor(Module, prop)) {
  abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
 }
}

function isExportedByForceFilesystem(name) {
 return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "removeRunDependency";
}

function missingGlobal(sym, msg) {
 if (typeof globalThis !== "undefined") {
  Object.defineProperty(globalThis, sym, {
   configurable: true,
   get() {
    warnOnce(`\`${sym}\` is not longer defined by emscripten. ${msg}`);
    return undefined;
   }
  });
 }
}

missingGlobal("buffer", "Please use HEAP8.buffer or wasmMemory.buffer");

missingGlobal("asm", "Please use wasmExports instead");

function missingLibrarySymbol(sym) {
 if (typeof globalThis !== "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
  Object.defineProperty(globalThis, sym, {
   configurable: true,
   get() {
    var msg = `\`${sym}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`;
    var librarySymbol = sym;
    if (!librarySymbol.startsWith("_")) {
     librarySymbol = "$" + sym;
    }
    msg += ` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${librarySymbol}')`;
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    warnOnce(msg);
    return undefined;
   }
  });
 }
 unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
 if (!Object.getOwnPropertyDescriptor(Module, sym)) {
  Object.defineProperty(Module, sym, {
   configurable: true,
   get() {
    var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    if (isExportedByForceFilesystem(sym)) {
     msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
    }
    abort(msg);
   }
  });
 }
}

var MAX_UINT8 = (2 ** 8) - 1;

var MAX_UINT16 = (2 ** 16) - 1;

var MAX_UINT32 = (2 ** 32) - 1;

var MAX_UINT53 = (2 ** 53) - 1;

var MAX_UINT64 = (2 ** 64) - 1;

var MIN_INT8 = -(2 ** (8 - 1)) + 1;

var MIN_INT16 = -(2 ** (16 - 1)) + 1;

var MIN_INT32 = -(2 ** (32 - 1)) + 1;

var MIN_INT53 = -(2 ** (53 - 1)) + 1;

var MIN_INT64 = -(2 ** (64 - 1)) + 1;

function checkInt(value, bits, min, max) {
 assert(Number.isInteger(Number(value)), `attempt to write non-integer (${value}) into integer heap`);
 assert(value <= max, `value (${value}) too large to write as ${bits}-bit value`);
 assert(value >= min, `value (${value}) too small to write as ${bits}-bit value`);
}

var checkInt1 = value => checkInt(value, 1, 1);

var checkInt8 = value => checkInt(value, 8, MIN_INT8, MAX_UINT8);

var checkInt16 = value => checkInt(value, 16, MIN_INT16, MAX_UINT16);

var checkInt32 = value => checkInt(value, 32, MIN_INT32, MAX_UINT32);

var checkInt53 = value => checkInt(value, 53, MIN_INT53, MAX_UINT53);

var checkInt64 = value => checkInt(value, 64, MIN_INT64, MAX_UINT64);

var runtimeDebug = true;

var printObjectList = [];

function prettyPrint(arg) {
 if (typeof arg == "undefined") return "!UNDEFINED!";
 if (typeof arg == "boolean") arg = arg + 0;
 if (!arg) return arg;
 var index = printObjectList.indexOf(arg);
 if (index >= 0) return "<" + arg + "|" + index + ">";
 if (arg.toString() == "[object HTMLImageElement]") {
  return arg + "\n\n";
 }
 if (arg.byteLength) {
  return "{" + Array.prototype.slice.call(arg, 0, Math.min(arg.length, 400)) + "}";
 }
 if (typeof arg == "function") {
  return "<function>";
 } else if (typeof arg == "object") {
  printObjectList.push(arg);
  return "<" + arg + "|" + (printObjectList.length - 1) + ">";
 } else if (typeof arg == "number") {
  if (arg > 0) return ptrToString(arg) + " (" + arg + ")";
 }
 return arg;
}

function dbg(...args) {
 console.warn(...args);
}

var ASM_CONSTS = {
 660364: ($0, $1, $2) => {
  objs[$0].dispatchEvent(new CustomEvent(UTF8ToString($1), {
   "detail": UTF8ToString($2)
  }));
 }
};

/** @constructor */ function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = `Program terminated with exit(${status})`;
 this.status = status;
}

var terminateWorker = worker => {
 worker.terminate();
 worker.onmessage = e => {
  var cmd = e["data"]["cmd"];
  err(`received "${cmd}" command from terminated worker: ${worker.workerID}`);
 };
};

var killThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! killThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in killThread!");
 var worker = PThread.pthreads[pthread_ptr];
 delete PThread.pthreads[pthread_ptr];
 terminateWorker(worker);
 __emscripten_thread_free_data(pthread_ptr);
 PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
 worker.pthread_ptr = 0;
};

var cancelThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cancelThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in cancelThread!");
 var worker = PThread.pthreads[pthread_ptr];
 worker.postMessage({
  "cmd": "cancel"
 });
};

var cleanupThread = pthread_ptr => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! cleanupThread() can only ever be called from main application thread!");
 assert(pthread_ptr, "Internal Error! Null pthread_ptr in cleanupThread!");
 var worker = PThread.pthreads[pthread_ptr];
 assert(worker);
 PThread.returnWorkerToPool(worker);
};

var zeroMemory = (address, size) => {
 HEAPU8.fill(0, address, address + size);
 return address;
};

var spawnThread = threadParams => {
 assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! spawnThread() can only ever be called from main application thread!");
 assert(threadParams.pthread_ptr, "Internal error, no pthread ptr!");
 var worker = PThread.getNewWorker();
 if (!worker) {
  return 6;
 }
 assert(!worker.pthread_ptr, "Internal error!");
 PThread.runningWorkers.push(worker);
 PThread.pthreads[threadParams.pthread_ptr] = worker;
 worker.pthread_ptr = threadParams.pthread_ptr;
 var msg = {
  "cmd": "run",
  "start_routine": threadParams.startRoutine,
  "arg": threadParams.arg,
  "pthread_ptr": threadParams.pthread_ptr
 };
 worker.postMessage(msg, threadParams.transferList);
 return 0;
};

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var withStackSave = f => {
 var stack = stackSave();
 var ret = f();
 stackRestore(stack);
 return ret;
};

var MAX_INT53 = 9007199254740992;

var MIN_INT53 = -9007199254740992;

var bigintToI53Checked = num => (num < MIN_INT53 || num > MAX_INT53) ? NaN : Number(num);

/** @type{function(number, (number|boolean), ...number)} */ var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => withStackSave(() => {
 var serializedNumCallArgs = callArgs.length * 2;
 var args = stackAlloc(serializedNumCallArgs * 8);
 var b = ((args) >> 3);
 for (var i = 0; i < callArgs.length; i++) {
  var arg = callArgs[i];
  if (typeof arg == "bigint") {
   HEAP64[b + 2 * i] = 1n;
   HEAP64[b + 2 * i + 1] = arg;
  } else {
   HEAP64[b + 2 * i] = 0n;
   SAFE_HEAP_STORE_D((b + 2 * i + 1) * 8, arg, 8);
  }
 }
 return __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync);
});

function _proc_exit(code) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(0, 0, 1, code);
 dbg(`proc_exit: ${code}`);
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  PThread.terminateAllThreads();
  Module["onExit"]?.(code);
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
}

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
 EXITSTATUS = status;
 checkUnflushedContent();
 if (ENVIRONMENT_IS_PTHREAD) {
  assert(!implicit);
  exitOnMainThread(status);
  throw "unwind";
 }
 if (keepRuntimeAlive() && !implicit) {
  var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
  readyPromiseReject(msg);
  err(msg);
 }
 _proc_exit(status);
};

var _exit = exitJS;

var ptrToString = ptr => {
 assert(typeof ptr === "number");
 ptr >>>= 0;
 return "0x" + ptr.toString(16).padStart(8, "0");
};

var handleException = e => {
 if (e instanceof ExitStatus || e == "unwind") {
  dbg(`handleException: unwinding: EXITSTATUS=${EXITSTATUS}`);
  return EXITSTATUS;
 }
 checkStackCookie();
 if (e instanceof WebAssembly.RuntimeError) {
  if (_emscripten_stack_get_current() <= 0) {
   err("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)");
  }
 }
 quit_(1, e);
};

var PThread = {
 unusedWorkers: [],
 runningWorkers: [],
 tlsInitFunctions: [],
 pthreads: {},
 nextWorkerID: 1,
 debugInit() {
  function pthreadLogPrefix() {
   var t = 0;
   if (runtimeInitialized && typeof _pthread_self != "undefined") {
    t = _pthread_self();
   }
   return "w:" + (Module["workerID"] || 0) + ",t:" + ptrToString(t) + ": ";
  }
  var origDbg = dbg;
  dbg = (...args) => origDbg(pthreadLogPrefix() + args.join(" "));
 },
 init() {
  PThread.debugInit();
  if (ENVIRONMENT_IS_PTHREAD) {
   PThread.initWorker();
  } else {
   PThread.initMainThread();
  }
 },
 initMainThread() {
  var pthreadPoolSize = 2;
  while (pthreadPoolSize--) {
   PThread.allocateUnusedWorker();
  }
  addOnPreRun(() => {
   addRunDependency("loading-workers");
   PThread.loadWasmModuleToAllWorkers(() => removeRunDependency("loading-workers"));
  });
 },
 initWorker() {
  PThread["receiveObjectTransfer"] = PThread.receiveObjectTransfer;
  PThread["threadInitTLS"] = PThread.threadInitTLS;
  PThread["setExitStatus"] = PThread.setExitStatus;
  noExitRuntime = false;
 },
 setExitStatus: status => EXITSTATUS = status,
 terminateAllThreads__deps: [ "$terminateWorker" ],
 terminateAllThreads: () => {
  assert(!ENVIRONMENT_IS_PTHREAD, "Internal Error! terminateAllThreads() can only ever be called from main application thread!");
  for (var worker of PThread.runningWorkers) {
   terminateWorker(worker);
  }
  for (var worker of PThread.unusedWorkers) {
   terminateWorker(worker);
  }
  PThread.unusedWorkers = [];
  PThread.runningWorkers = [];
  PThread.pthreads = [];
 },
 returnWorkerToPool: worker => {
  var pthread_ptr = worker.pthread_ptr;
  delete PThread.pthreads[pthread_ptr];
  PThread.unusedWorkers.push(worker);
  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
  worker.pthread_ptr = 0;
  __emscripten_thread_free_data(pthread_ptr);
 },
 receiveObjectTransfer(data) {},
 threadInitTLS() {
  PThread.tlsInitFunctions.forEach(f => f());
 },
 loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
  worker.onmessage = e => {
   var d = e["data"];
   var cmd = d["cmd"];
   if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
    var targetWorker = PThread.pthreads[d["targetThread"]];
    if (targetWorker) {
     targetWorker.postMessage(d, d["transferList"]);
    } else {
     err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d["targetThread"]}, but that thread no longer exists!`);
    }
    return;
   }
   if (cmd === "checkMailbox") {
    checkMailbox();
   } else if (cmd === "spawnThread") {
    spawnThread(d);
   } else if (cmd === "cleanupThread") {
    cleanupThread(d["thread"]);
   } else if (cmd === "killThread") {
    killThread(d["thread"]);
   } else if (cmd === "cancelThread") {
    cancelThread(d["thread"]);
   } else if (cmd === "loaded") {
    worker.loaded = true;
    onFinishedLoading(worker);
   } else if (cmd === "alert") {
    alert(`Thread ${d["threadId"]}: ${d["text"]}`);
   } else if (d.target === "setimmediate") {
    worker.postMessage(d);
   } else if (cmd === "callHandler") {
    Module[d["handler"]](...d["args"]);
   } else if (cmd) {
    err(`worker sent an unknown command ${cmd}`);
   }
  };
  worker.onerror = e => {
   var message = "worker sent an error!";
   if (worker.pthread_ptr) {
    message = `Pthread ${ptrToString(worker.pthread_ptr)} sent an error!`;
   }
   err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
   throw e;
  };
  assert(wasmMemory instanceof WebAssembly.Memory, "WebAssembly memory should have been loaded by now!");
  assert(wasmModule instanceof WebAssembly.Module, "WebAssembly Module should have been loaded by now!");
  var handlers = [];
  var knownHandlers = [ "onExit", "onAbort", "print", "printErr" ];
  for (var handler of knownHandlers) {
   if (Module.hasOwnProperty(handler)) {
    handlers.push(handler);
   }
  }
  worker.workerID = PThread.nextWorkerID++;
  worker.postMessage({
   "cmd": "load",
   "handlers": handlers,
   "urlOrBlob": Module["mainScriptUrlOrBlob"] || _scriptDir,
   "wasmMemory": wasmMemory,
   "wasmModule": wasmModule,
   "wasmOffsetConverter": wasmOffsetConverter,
   "workerID": worker.workerID
  });
 }),
 loadWasmModuleToAllWorkers(onMaybeReady) {
  if (ENVIRONMENT_IS_PTHREAD) {
   return onMaybeReady();
  }
  let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
  Module["pthreadPoolReady"] = pthreadPoolReady;
  onMaybeReady();
 },
 allocateUnusedWorker() {
  var worker;
  var pthreadMainJs = locateFile("Vosklet.worker.js");
  worker = new Worker(pthreadMainJs);
  PThread.unusedWorkers.push(worker);
 },
 getNewWorker() {
  if (PThread.unusedWorkers.length == 0) {
   err("Tried to spawn a new thread, but the thread pool is exhausted.\n" + "This might result in a deadlock unless some threads eventually exit or the code explicitly breaks out to the event loop.\n" + "If you want to increase the pool size, use setting `-sPTHREAD_POOL_SIZE=...`.");
   return;
  }
  return PThread.unusedWorkers.pop();
 }
};

Module["PThread"] = PThread;

var UTF8Decoder = new TextDecoder("utf8");

/**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */ var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 return UTF8Decoder.decode(heapOrArray.buffer ? heapOrArray.buffer instanceof SharedArrayBuffer ? heapOrArray.slice(idx, endPtr) : heapOrArray.subarray(idx, endPtr) : new Uint8Array(heapOrArray.slice(idx, endPtr)));
};

var callRuntimeCallbacks = callbacks => {
 while (callbacks.length > 0) {
  callbacks.shift()(Module);
 }
};

var establishStackSpace = () => {
 var pthread_ptr = _pthread_self();
 var stackHigh = SAFE_HEAP_LOAD((((pthread_ptr) + (52)) >> 2) * 4, 4, 1);
 var stackSize = SAFE_HEAP_LOAD((((pthread_ptr) + (56)) >> 2) * 4, 4, 1);
 var stackLow = stackHigh - stackSize;
 assert(stackHigh != 0);
 assert(stackLow != 0);
 assert(stackHigh > stackLow, "stackHigh must be higher then stackLow");
 _emscripten_stack_set_limits(stackHigh, stackLow);
 setStackLimits();
 stackRestore(stackHigh);
 writeStackCookie();
};

Module["establishStackSpace"] = establishStackSpace;

function exitOnMainThread(returnCode) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(1, 0, 0, returnCode);
 _exit(returnCode);
}

/**
     * @param {number} ptr
     * @param {string} type
     */ function getValue(ptr, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  return SAFE_HEAP_LOAD(ptr, 1, 0);

 case "i8":
  return SAFE_HEAP_LOAD(ptr, 1, 0);

 case "i16":
  return SAFE_HEAP_LOAD(((ptr) >> 1) * 2, 2, 0);

 case "i32":
  return SAFE_HEAP_LOAD(((ptr) >> 2) * 4, 4, 0);

 case "i64":
  return HEAP64[((ptr) >> 3)];

 case "float":
  return SAFE_HEAP_LOAD_D(((ptr) >> 2) * 4, 4, 0);

 case "double":
  return SAFE_HEAP_LOAD_D(((ptr) >> 3) * 8, 8, 0);

 case "*":
  return SAFE_HEAP_LOAD(((ptr) >> 2) * 4, 4, 1);

 default:
  abort(`invalid type for getValue: ${type}`);
 }
}

function getValue_safe(ptr, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  return HEAP8[ptr];

 case "i8":
  return HEAP8[ptr];

 case "i16":
  return HEAP16[((ptr) >> 1)];

 case "i32":
  return HEAP32[((ptr) >> 2)];

 case "i64":
  return HEAP64[((ptr) >> 3)];

 case "float":
  return HEAPF32[((ptr) >> 2)];

 case "double":
  return HEAPF64[((ptr) >> 3)];

 case "*":
  return HEAPU32[((ptr) >> 2)];

 default:
  abort(`invalid type for getValue: ${type}`);
 }
}

var wasmTableMirror = [];

var wasmTable;

var getWasmTableEntry = funcPtr => {
 var func = wasmTableMirror[funcPtr];
 if (!func) {
  if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
  wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
 }
 assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
 return func;
};

var invokeEntryPoint = (ptr, arg) => {
 var result = getWasmTableEntry(ptr)(arg);
 checkStackCookie();
 function finish(result) {
  if (keepRuntimeAlive()) {
   PThread.setExitStatus(result);
  } else {
   __emscripten_thread_exit(result);
  }
 }
 finish(result);
};

Module["invokeEntryPoint"] = invokeEntryPoint;

var noExitRuntime = Module["noExitRuntime"] || true;

var registerTLSInit = tlsInitFunc => PThread.tlsInitFunctions.push(tlsInitFunc);

var setStackLimits = () => {
 var stackLow = _emscripten_stack_get_base();
 var stackHigh = _emscripten_stack_get_end();
 dbg(`setStackLimits: ${ptrToString(stackLow)}, ${ptrToString(stackHigh)}`);
 ___set_stack_limits(stackLow, stackHigh);
};

/**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */ function setValue(ptr, value, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  SAFE_HEAP_STORE(ptr, value, 1);
  checkInt8(value);
  break;

 case "i8":
  SAFE_HEAP_STORE(ptr, value, 1);
  checkInt8(value);
  break;

 case "i16":
  SAFE_HEAP_STORE(((ptr) >> 1) * 2, value, 2);
  checkInt16(value);
  break;

 case "i32":
  SAFE_HEAP_STORE(((ptr) >> 2) * 4, value, 4);
  checkInt32(value);
  break;

 case "i64":
  HEAP64[((ptr) >> 3)] = BigInt(value);
  checkInt64(value);
  break;

 case "float":
  SAFE_HEAP_STORE_D(((ptr) >> 2) * 4, value, 4);
  break;

 case "double":
  SAFE_HEAP_STORE_D(((ptr) >> 3) * 8, value, 8);
  break;

 case "*":
  SAFE_HEAP_STORE(((ptr) >> 2) * 4, value, 4);
  break;

 default:
  abort(`invalid type for setValue: ${type}`);
 }
}

function setValue_safe(ptr, value, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  HEAP8[ptr] = value;
  checkInt8(value);
  break;

 case "i8":
  HEAP8[ptr] = value;
  checkInt8(value);
  break;

 case "i16":
  HEAP16[((ptr) >> 1)] = value;
  checkInt16(value);
  break;

 case "i32":
  HEAP32[((ptr) >> 2)] = value;
  checkInt32(value);
  break;

 case "i64":
  HEAP64[((ptr) >> 3)] = BigInt(value);
  checkInt64(value);
  break;

 case "float":
  HEAPF32[((ptr) >> 2)] = value;
  break;

 case "double":
  HEAPF64[((ptr) >> 3)] = value;
  break;

 case "*":
  HEAPU32[((ptr) >> 2)] = value;
  break;

 default:
  abort(`invalid type for setValue: ${type}`);
 }
}

var unSign = (value, bits) => {
 if (value >= 0) {
  return value;
 }
 return bits <= 32 ? 2 * Math.abs(1 << (bits - 1)) + value : Math.pow(2, bits) + value;
};

var warnOnce = text => {
 warnOnce.shown ||= {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  err(text);
 }
};

/**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */ var UTF8ToString = (ptr, maxBytesToRead) => {
 assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
 if (!ptr) return "";
 var maxPtr = ptr + maxBytesToRead;
 for (var end = ptr; !(end >= maxPtr) && SAFE_HEAP_LOAD(end, 1, 1); ) ++end;
 return UTF8Decoder.decode(HEAPU8.slice(ptr, end));
};

var ___assert_fail = (condition, filename, line, func) => {
 abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
};

class ExceptionInfo {
 constructor(excPtr) {
  this.excPtr = excPtr;
  this.ptr = excPtr - 24;
 }
 set_type(type) {
  SAFE_HEAP_STORE((((this.ptr) + (4)) >> 2) * 4, type, 4);
 }
 get_type() {
  return SAFE_HEAP_LOAD((((this.ptr) + (4)) >> 2) * 4, 4, 1);
 }
 set_destructor(destructor) {
  SAFE_HEAP_STORE((((this.ptr) + (8)) >> 2) * 4, destructor, 4);
 }
 get_destructor() {
  return SAFE_HEAP_LOAD((((this.ptr) + (8)) >> 2) * 4, 4, 1);
 }
 set_caught(caught) {
  caught = caught ? 1 : 0;
  SAFE_HEAP_STORE((this.ptr) + (12), caught, 1);
  checkInt8(caught);
 }
 get_caught() {
  return SAFE_HEAP_LOAD((this.ptr) + (12), 1, 0) != 0;
 }
 set_rethrown(rethrown) {
  rethrown = rethrown ? 1 : 0;
  SAFE_HEAP_STORE((this.ptr) + (13), rethrown, 1);
  checkInt8(rethrown);
 }
 get_rethrown() {
  return SAFE_HEAP_LOAD((this.ptr) + (13), 1, 0) != 0;
 }
 init(type, destructor) {
  this.set_adjusted_ptr(0);
  this.set_type(type);
  this.set_destructor(destructor);
 }
 set_adjusted_ptr(adjustedPtr) {
  SAFE_HEAP_STORE((((this.ptr) + (16)) >> 2) * 4, adjustedPtr, 4);
 }
 get_adjusted_ptr() {
  return SAFE_HEAP_LOAD((((this.ptr) + (16)) >> 2) * 4, 4, 1);
 }
 get_exception_ptr() {
  var isPointer = ___cxa_is_pointer_type(this.get_type());
  if (isPointer) {
   return SAFE_HEAP_LOAD(((this.excPtr) >> 2) * 4, 4, 1);
  }
  var adjusted = this.get_adjusted_ptr();
  if (adjusted !== 0) return adjusted;
  return this.excPtr;
 }
}

var exceptionLast = 0;

var uncaughtExceptionCount = 0;

var ___cxa_throw = (ptr, type, destructor) => {
 var info = new ExceptionInfo(ptr);
 info.init(type, destructor);
 exceptionLast = ptr;
 uncaughtExceptionCount++;
 assert(false, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
};

var ___emscripten_init_main_thread_js = tb => {
 __emscripten_thread_init(tb, /*is_main=*/ !ENVIRONMENT_IS_WORKER, /*is_runtime=*/ 1, /*can_block=*/ !ENVIRONMENT_IS_WEB, /*default_stacksize=*/ 65536, /*start_profiling=*/ false);
 PThread.threadInitTLS();
};

var ___emscripten_thread_cleanup = thread => {
 if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread); else postMessage({
  "cmd": "cleanupThread",
  "thread": thread
 });
};

var ___handle_stack_overflow = requested => {
 var base = _emscripten_stack_get_base();
 var end = _emscripten_stack_get_end();
 abort(`stack overflow (Attempt to set SP to ${ptrToString(requested)}` + `, with stack limits [${ptrToString(end)} - ${ptrToString(base)}` + "]). If you require more stack space build with -sSTACK_SIZE=<bytes>");
};

function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
 return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg);
}

var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
 if (typeof SharedArrayBuffer == "undefined") {
  err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
  return 6;
 }
 var transferList = [];
 var error = 0;
 if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
  return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
 }
 if (error) return error;
 var threadParams = {
  startRoutine: startRoutine,
  pthread_ptr: pthread_ptr,
  arg: arg,
  transferList: transferList
 };
 if (ENVIRONMENT_IS_PTHREAD) {
  threadParams.cmd = "spawnThread";
  postMessage(threadParams, transferList);
  return 0;
 }
 return spawnThread(threadParams);
};

var ___pthread_kill_js = (thread, signal) => {
 if (signal === 33) {
  if (!ENVIRONMENT_IS_PTHREAD) cancelThread(thread); else postMessage({
   "cmd": "cancelThread",
   "thread": thread
  });
 } else {
  if (!ENVIRONMENT_IS_PTHREAD) killThread(thread); else postMessage({
   "cmd": "killThread",
   "thread": thread
  });
 }
 return 0;
};

var embindRepr = v => {
 if (v === null) {
  return "null";
 }
 var t = typeof v;
 if (t === "object" || t === "array" || t === "function") {
  return v.toString();
 } else {
  return "" + v;
 }
};

var embind_init_charCodes = () => {
 var codes = new Array(256);
 for (var i = 0; i < 256; ++i) {
  codes[i] = String.fromCharCode(i);
 }
 embind_charCodes = codes;
};

var embind_charCodes;

var readLatin1String = ptr => {
 var ret = "";
 var c = ptr;
 while (SAFE_HEAP_LOAD(c, 1, 1)) {
  ret += embind_charCodes[SAFE_HEAP_LOAD(c++, 1, 1)];
 }
 return ret;
};

var awaitingDependencies = {};

var registeredTypes = {};

var typeDependencies = {};

var BindingError;

var throwBindingError = message => {
 throw new BindingError(message);
};

var InternalError;

var throwInternalError = message => {
 throw new InternalError(message);
};

var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
 myTypes.forEach(function(type) {
  typeDependencies[type] = dependentTypes;
 });
 function onComplete(typeConverters) {
  var myTypeConverters = getTypeConverters(typeConverters);
  if (myTypeConverters.length !== myTypes.length) {
   throwInternalError("Mismatched type converter count");
  }
  for (var i = 0; i < myTypes.length; ++i) {
   registerType(myTypes[i], myTypeConverters[i]);
  }
 }
 var typeConverters = new Array(dependentTypes.length);
 var unregisteredTypes = [];
 var registered = 0;
 dependentTypes.forEach((dt, i) => {
  if (registeredTypes.hasOwnProperty(dt)) {
   typeConverters[i] = registeredTypes[dt];
  } else {
   unregisteredTypes.push(dt);
   if (!awaitingDependencies.hasOwnProperty(dt)) {
    awaitingDependencies[dt] = [];
   }
   awaitingDependencies[dt].push(() => {
    typeConverters[i] = registeredTypes[dt];
    ++registered;
    if (registered === unregisteredTypes.length) {
     onComplete(typeConverters);
    }
   });
  }
 });
 if (0 === unregisteredTypes.length) {
  onComplete(typeConverters);
 }
};

/** @param {Object=} options */ function sharedRegisterType(rawType, registeredInstance, options = {}) {
 var name = registeredInstance.name;
 if (!rawType) {
  throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
 }
 if (registeredTypes.hasOwnProperty(rawType)) {
  if (options.ignoreDuplicateRegistrations) {
   return;
  } else {
   throwBindingError(`Cannot register type '${name}' twice`);
  }
 }
 registeredTypes[rawType] = registeredInstance;
 delete typeDependencies[rawType];
 if (awaitingDependencies.hasOwnProperty(rawType)) {
  var callbacks = awaitingDependencies[rawType];
  delete awaitingDependencies[rawType];
  callbacks.forEach(cb => cb());
 }
}

/** @param {Object=} options */ function registerType(rawType, registeredInstance, options = {}) {
 if (!("argPackAdvance" in registeredInstance)) {
  throw new TypeError("registerType registeredInstance requires argPackAdvance");
 }
 return sharedRegisterType(rawType, registeredInstance, options);
}

var integerReadValueFromPointer = (name, width, signed) => {
 switch (width) {
 case 1:
  return signed ? pointer => SAFE_HEAP_LOAD(pointer, 1, 0) : pointer => SAFE_HEAP_LOAD(pointer, 1, 1);

 case 2:
  return signed ? pointer => SAFE_HEAP_LOAD(((pointer) >> 1) * 2, 2, 0) : pointer => SAFE_HEAP_LOAD(((pointer) >> 1) * 2, 2, 1);

 case 4:
  return signed ? pointer => SAFE_HEAP_LOAD(((pointer) >> 2) * 4, 4, 0) : pointer => SAFE_HEAP_LOAD(((pointer) >> 2) * 4, 4, 1);

 case 8:
  return signed ? pointer => HEAP64[((pointer) >> 3)] : pointer => HEAPU64[((pointer) >> 3)];

 default:
  throw new TypeError(`invalid integer width (${width}): ${name}`);
 }
};

/** @suppress {globalThis} */ var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {
 name = readLatin1String(name);
 var isUnsignedType = (name.indexOf("u") != -1);
 if (isUnsignedType) {
  maxRange = (1n << 64n) - 1n;
 }
 registerType(primitiveType, {
  name: name,
  "fromWireType": value => value,
  "toWireType": function(destructors, value) {
   if (typeof value != "bigint" && typeof value != "number") {
    throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${this.name}`);
   }
   if (typeof value == "number") {
    value = BigInt(value);
   }
   if (value < minRange || value > maxRange) {
    throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`);
   }
   return value;
  },
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": integerReadValueFromPointer(name, size, !isUnsignedType),
  destructorFunction: null
 });
};

var GenericWireTypeSize = 8;

/** @suppress {globalThis} */ var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
 name = readLatin1String(name);
 registerType(rawType, {
  name: name,
  "fromWireType": function(wt) {
   return !!wt;
  },
  "toWireType": function(destructors, o) {
   return o ? trueValue : falseValue;
  },
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": function(pointer) {
   return this["fromWireType"](SAFE_HEAP_LOAD(pointer, 1, 1));
  },
  destructorFunction: null
 });
};

var shallowCopyInternalPointer = o => ({
 count: o.count,
 deleteScheduled: o.deleteScheduled,
 preservePointerOnDelete: o.preservePointerOnDelete,
 ptr: o.ptr,
 ptrType: o.ptrType,
 smartPtr: o.smartPtr,
 smartPtrType: o.smartPtrType
});

var throwInstanceAlreadyDeleted = obj => {
 function getInstanceTypeName(handle) {
  return handle.$$.ptrType.registeredClass.name;
 }
 throwBindingError(getInstanceTypeName(obj) + " instance already deleted");
};

var finalizationRegistry = false;

var detachFinalizer = handle => {};

var runDestructor = $$ => {
 if ($$.smartPtr) {
  $$.smartPtrType.rawDestructor($$.smartPtr);
 } else {
  $$.ptrType.registeredClass.rawDestructor($$.ptr);
 }
};

var releaseClassHandle = $$ => {
 $$.count.value -= 1;
 var toDelete = 0 === $$.count.value;
 if (toDelete) {
  runDestructor($$);
 }
};

var downcastPointer = (ptr, ptrClass, desiredClass) => {
 if (ptrClass === desiredClass) {
  return ptr;
 }
 if (undefined === desiredClass.baseClass) {
  return null;
 }
 var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
 if (rv === null) {
  return null;
 }
 return desiredClass.downcast(rv);
};

var registeredPointers = {};

var getInheritedInstanceCount = () => Object.keys(registeredInstances).length;

var getLiveInheritedInstances = () => {
 var rv = [];
 for (var k in registeredInstances) {
  if (registeredInstances.hasOwnProperty(k)) {
   rv.push(registeredInstances[k]);
  }
 }
 return rv;
};

var deletionQueue = [];

var flushPendingDeletes = () => {
 while (deletionQueue.length) {
  var obj = deletionQueue.pop();
  obj.$$.deleteScheduled = false;
  obj["delete"]();
 }
};

var delayFunction;

var setDelayFunction = fn => {
 delayFunction = fn;
 if (deletionQueue.length && delayFunction) {
  delayFunction(flushPendingDeletes);
 }
};

var init_embind = () => {
 Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
 Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
 Module["flushPendingDeletes"] = flushPendingDeletes;
 Module["setDelayFunction"] = setDelayFunction;
};

var registeredInstances = {};

var getBasestPointer = (class_, ptr) => {
 if (ptr === undefined) {
  throwBindingError("ptr should not be undefined");
 }
 while (class_.baseClass) {
  ptr = class_.upcast(ptr);
  class_ = class_.baseClass;
 }
 return ptr;
};

var getInheritedInstance = (class_, ptr) => {
 ptr = getBasestPointer(class_, ptr);
 return registeredInstances[ptr];
};

var makeClassHandle = (prototype, record) => {
 if (!record.ptrType || !record.ptr) {
  throwInternalError("makeClassHandle requires ptr and ptrType");
 }
 var hasSmartPtrType = !!record.smartPtrType;
 var hasSmartPtr = !!record.smartPtr;
 if (hasSmartPtrType !== hasSmartPtr) {
  throwInternalError("Both smartPtrType and smartPtr must be specified");
 }
 record.count = {
  value: 1
 };
 return attachFinalizer(Object.create(prototype, {
  $$: {
   value: record,
   writable: true
  }
 }));
};

/** @suppress {globalThis} */ function RegisteredPointer_fromWireType(ptr) {
 var rawPointer = this.getPointee(ptr);
 if (!rawPointer) {
  this.destructor(ptr);
  return null;
 }
 var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
 if (undefined !== registeredInstance) {
  if (0 === registeredInstance.$$.count.value) {
   registeredInstance.$$.ptr = rawPointer;
   registeredInstance.$$.smartPtr = ptr;
   return registeredInstance["clone"]();
  } else {
   var rv = registeredInstance["clone"]();
   this.destructor(ptr);
   return rv;
  }
 }
 function makeDefaultHandle() {
  if (this.isSmartPointer) {
   return makeClassHandle(this.registeredClass.instancePrototype, {
    ptrType: this.pointeeType,
    ptr: rawPointer,
    smartPtrType: this,
    smartPtr: ptr
   });
  } else {
   return makeClassHandle(this.registeredClass.instancePrototype, {
    ptrType: this,
    ptr: ptr
   });
  }
 }
 var actualType = this.registeredClass.getActualType(rawPointer);
 var registeredPointerRecord = registeredPointers[actualType];
 if (!registeredPointerRecord) {
  return makeDefaultHandle.call(this);
 }
 var toType;
 if (this.isConst) {
  toType = registeredPointerRecord.constPointerType;
 } else {
  toType = registeredPointerRecord.pointerType;
 }
 var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
 if (dp === null) {
  return makeDefaultHandle.call(this);
 }
 if (this.isSmartPointer) {
  return makeClassHandle(toType.registeredClass.instancePrototype, {
   ptrType: toType,
   ptr: dp,
   smartPtrType: this,
   smartPtr: ptr
  });
 } else {
  return makeClassHandle(toType.registeredClass.instancePrototype, {
   ptrType: toType,
   ptr: dp
  });
 }
}

var attachFinalizer = handle => {
 if ("undefined" === typeof FinalizationRegistry) {
  attachFinalizer = handle => handle;
  return handle;
 }
 finalizationRegistry = new FinalizationRegistry(info => {
  console.warn(info.leakWarning.stack.replace(/^Error: /, ""));
  releaseClassHandle(info.$$);
 });
 attachFinalizer = handle => {
  var $$ = handle.$$;
  var hasSmartPtr = !!$$.smartPtr;
  if (hasSmartPtr) {
   var info = {
    $$: $$
   };
   var cls = $$.ptrType.registeredClass;
   info.leakWarning = new Error(`Embind found a leaked C++ instance ${cls.name} <${ptrToString($$.ptr)}>.\n` + "We'll free it automatically in this case, but this functionality is not reliable across various environments.\n" + "Make sure to invoke .delete() manually once you're done with the instance instead.\n" + "Originally allocated");
   if ("captureStackTrace" in Error) {
    Error.captureStackTrace(info.leakWarning, RegisteredPointer_fromWireType);
   }
   finalizationRegistry.register(handle, info, handle);
  }
  return handle;
 };
 detachFinalizer = handle => finalizationRegistry.unregister(handle);
 return attachFinalizer(handle);
};

var init_ClassHandle = () => {
 Object.assign(ClassHandle.prototype, {
  "isAliasOf"(other) {
   if (!(this instanceof ClassHandle)) {
    return false;
   }
   if (!(other instanceof ClassHandle)) {
    return false;
   }
   var leftClass = this.$$.ptrType.registeredClass;
   var left = this.$$.ptr;
   other.$$ = /** @type {Object} */ (other.$$);
   var rightClass = other.$$.ptrType.registeredClass;
   var right = other.$$.ptr;
   while (leftClass.baseClass) {
    left = leftClass.upcast(left);
    leftClass = leftClass.baseClass;
   }
   while (rightClass.baseClass) {
    right = rightClass.upcast(right);
    rightClass = rightClass.baseClass;
   }
   return leftClass === rightClass && left === right;
  },
  "clone"() {
   if (!this.$$.ptr) {
    throwInstanceAlreadyDeleted(this);
   }
   if (this.$$.preservePointerOnDelete) {
    this.$$.count.value += 1;
    return this;
   } else {
    var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
     $$: {
      value: shallowCopyInternalPointer(this.$$)
     }
    }));
    clone.$$.count.value += 1;
    clone.$$.deleteScheduled = false;
    return clone;
   }
  },
  "delete"() {
   if (!this.$$.ptr) {
    throwInstanceAlreadyDeleted(this);
   }
   if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
    throwBindingError("Object already scheduled for deletion");
   }
   detachFinalizer(this);
   releaseClassHandle(this.$$);
   if (!this.$$.preservePointerOnDelete) {
    this.$$.smartPtr = undefined;
    this.$$.ptr = undefined;
   }
  },
  "isDeleted"() {
   return !this.$$.ptr;
  },
  "deleteLater"() {
   if (!this.$$.ptr) {
    throwInstanceAlreadyDeleted(this);
   }
   if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
    throwBindingError("Object already scheduled for deletion");
   }
   deletionQueue.push(this);
   if (deletionQueue.length === 1 && delayFunction) {
    delayFunction(flushPendingDeletes);
   }
   this.$$.deleteScheduled = true;
   return this;
  }
 });
};

/** @constructor */ function ClassHandle() {}

var createNamedFunction = (name, body) => Object.defineProperty(body, "name", {
 value: name
});

var ensureOverloadTable = (proto, methodName, humanName) => {
 if (undefined === proto[methodName].overloadTable) {
  var prevFunc = proto[methodName];
  proto[methodName] = function(...args) {
   if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
    throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
   }
   return proto[methodName].overloadTable[args.length].apply(this, args);
  };
  proto[methodName].overloadTable = [];
  proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
 }
};

/** @param {number=} numArguments */ var exposePublicSymbol = (name, value, numArguments) => {
 if (Module.hasOwnProperty(name)) {
  if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
   throwBindingError(`Cannot register public name '${name}' twice`);
  }
  ensureOverloadTable(Module, name, name);
  if (Module.hasOwnProperty(numArguments)) {
   throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
  }
  Module[name].overloadTable[numArguments] = value;
 } else {
  Module[name] = value;
  if (undefined !== numArguments) {
   Module[name].numArguments = numArguments;
  }
 }
};

var char_0 = 48;

var char_9 = 57;

var makeLegalFunctionName = name => {
 if (undefined === name) {
  return "_unknown";
 }
 name = name.replace(/[^a-zA-Z0-9_]/g, "$");
 var f = name.charCodeAt(0);
 if (f >= char_0 && f <= char_9) {
  return `_${name}`;
 }
 return name;
};

/** @constructor */ function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
 this.name = name;
 this.constructor = constructor;
 this.instancePrototype = instancePrototype;
 this.rawDestructor = rawDestructor;
 this.baseClass = baseClass;
 this.getActualType = getActualType;
 this.upcast = upcast;
 this.downcast = downcast;
 this.pureVirtualFunctions = [];
}

var upcastPointer = (ptr, ptrClass, desiredClass) => {
 while (ptrClass !== desiredClass) {
  if (!ptrClass.upcast) {
   throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
  }
  ptr = ptrClass.upcast(ptr);
  ptrClass = ptrClass.baseClass;
 }
 return ptr;
};

/** @suppress {globalThis} */ function constNoSmartPtrRawPointerToWireType(destructors, handle) {
 if (handle === null) {
  if (this.isReference) {
   throwBindingError(`null is not a valid ${this.name}`);
  }
  return 0;
 }
 if (!handle.$$) {
  throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
 }
 if (!handle.$$.ptr) {
  throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
 }
 var handleClass = handle.$$.ptrType.registeredClass;
 var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
 return ptr;
}

/** @suppress {globalThis} */ function genericPointerToWireType(destructors, handle) {
 var ptr;
 if (handle === null) {
  if (this.isReference) {
   throwBindingError(`null is not a valid ${this.name}`);
  }
  if (this.isSmartPointer) {
   ptr = this.rawConstructor();
   if (destructors !== null) {
    destructors.push(this.rawDestructor, ptr);
   }
   return ptr;
  } else {
   return 0;
  }
 }
 if (!handle || !handle.$$) {
  throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
 }
 if (!handle.$$.ptr) {
  throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
 }
 if (!this.isConst && handle.$$.ptrType.isConst) {
  throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
 }
 var handleClass = handle.$$.ptrType.registeredClass;
 ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
 if (this.isSmartPointer) {
  if (undefined === handle.$$.smartPtr) {
   throwBindingError("Passing raw pointer to smart pointer is illegal");
  }
  switch (this.sharingPolicy) {
  case 0:
   if (handle.$$.smartPtrType === this) {
    ptr = handle.$$.smartPtr;
   } else {
    throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
   }
   break;

  case 1:
   ptr = handle.$$.smartPtr;
   break;

  case 2:
   if (handle.$$.smartPtrType === this) {
    ptr = handle.$$.smartPtr;
   } else {
    var clonedHandle = handle["clone"]();
    ptr = this.rawShare(ptr, Emval.toHandle(() => clonedHandle["delete"]()));
    if (destructors !== null) {
     destructors.push(this.rawDestructor, ptr);
    }
   }
   break;

  default:
   throwBindingError("Unsupporting sharing policy");
  }
 }
 return ptr;
}

/** @suppress {globalThis} */ function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
 if (handle === null) {
  if (this.isReference) {
   throwBindingError(`null is not a valid ${this.name}`);
  }
  return 0;
 }
 if (!handle.$$) {
  throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
 }
 if (!handle.$$.ptr) {
  throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
 }
 if (handle.$$.ptrType.isConst) {
  throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
 }
 var handleClass = handle.$$.ptrType.registeredClass;
 var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
 return ptr;
}

/** @suppress {globalThis} */ function readPointer(pointer) {
 return this["fromWireType"](SAFE_HEAP_LOAD(((pointer) >> 2) * 4, 4, 1));
}

var init_RegisteredPointer = () => {
 Object.assign(RegisteredPointer.prototype, {
  getPointee(ptr) {
   if (this.rawGetPointee) {
    ptr = this.rawGetPointee(ptr);
   }
   return ptr;
  },
  destructor(ptr) {
   this.rawDestructor?.(ptr);
  },
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": readPointer,
  "fromWireType": RegisteredPointer_fromWireType
 });
};

/** @constructor
      @param {*=} pointeeType,
      @param {*=} sharingPolicy,
      @param {*=} rawGetPointee,
      @param {*=} rawConstructor,
      @param {*=} rawShare,
      @param {*=} rawDestructor,
       */ function RegisteredPointer(name, registeredClass, isReference, isConst,  isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
 this.name = name;
 this.registeredClass = registeredClass;
 this.isReference = isReference;
 this.isConst = isConst;
 this.isSmartPointer = isSmartPointer;
 this.pointeeType = pointeeType;
 this.sharingPolicy = sharingPolicy;
 this.rawGetPointee = rawGetPointee;
 this.rawConstructor = rawConstructor;
 this.rawShare = rawShare;
 this.rawDestructor = rawDestructor;
 if (!isSmartPointer && registeredClass.baseClass === undefined) {
  if (isConst) {
   this["toWireType"] = constNoSmartPtrRawPointerToWireType;
   this.destructorFunction = null;
  } else {
   this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
   this.destructorFunction = null;
  }
 } else {
  this["toWireType"] = genericPointerToWireType;
 }
}

/** @param {number=} numArguments */ var replacePublicSymbol = (name, value, numArguments) => {
 if (!Module.hasOwnProperty(name)) {
  throwInternalError("Replacing nonexistent public symbol");
 }
 if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
  Module[name].overloadTable[numArguments] = value;
 } else {
  Module[name] = value;
  Module[name].argCount = numArguments;
 }
};

var embind__requireFunction = (signature, rawFunction) => {
 signature = readLatin1String(signature);
 function makeDynCaller() {
  return getWasmTableEntry(rawFunction);
 }
 var fp = makeDynCaller();
 if (typeof fp != "function") {
  throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
 }
 return fp;
};

var extendError = (baseErrorType, errorName) => {
 var errorClass = createNamedFunction(errorName, function(message) {
  this.name = errorName;
  this.message = message;
  var stack = (new Error(message)).stack;
  if (stack !== undefined) {
   this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
  }
 });
 errorClass.prototype = Object.create(baseErrorType.prototype);
 errorClass.prototype.constructor = errorClass;
 errorClass.prototype.toString = function() {
  if (this.message === undefined) {
   return this.name;
  } else {
   return `${this.name}: ${this.message}`;
  }
 };
 return errorClass;
};

var UnboundTypeError;

var getTypeName = type => {
 var ptr = ___getTypeName(type);
 var rv = readLatin1String(ptr);
 _free(ptr);
 return rv;
};

var throwUnboundTypeError = (message, types) => {
 var unboundTypes = [];
 var seen = {};
 function visit(type) {
  if (seen[type]) {
   return;
  }
  if (registeredTypes[type]) {
   return;
  }
  if (typeDependencies[type]) {
   typeDependencies[type].forEach(visit);
   return;
  }
  unboundTypes.push(type);
  seen[type] = true;
 }
 types.forEach(visit);
 throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([ ", " ]));
};

var __embind_register_class = (rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) => {
 name = readLatin1String(name);
 getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
 upcast &&= embind__requireFunction(upcastSignature, upcast);
 downcast &&= embind__requireFunction(downcastSignature, downcast);
 rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
 var legalFunctionName = makeLegalFunctionName(name);
 exposePublicSymbol(legalFunctionName, function() {
  throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [ baseClassRawType ]);
 });
 whenDependentTypesAreResolved([ rawType, rawPointerType, rawConstPointerType ], baseClassRawType ? [ baseClassRawType ] : [], base => {
  base = base[0];
  var baseClass;
  var basePrototype;
  if (baseClassRawType) {
   baseClass = base.registeredClass;
   basePrototype = baseClass.instancePrototype;
  } else {
   basePrototype = ClassHandle.prototype;
  }
  var constructor = createNamedFunction(name, function(...args) {
   if (Object.getPrototypeOf(this) !== instancePrototype) {
    throw new BindingError("Use 'new' to construct " + name);
   }
   if (undefined === registeredClass.constructor_body) {
    throw new BindingError(name + " has no accessible constructor");
   }
   var body = registeredClass.constructor_body[args.length];
   if (undefined === body) {
    throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`);
   }
   return body.apply(this, args);
  });
  var instancePrototype = Object.create(basePrototype, {
   constructor: {
    value: constructor
   }
  });
  constructor.prototype = instancePrototype;
  var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
  if (registeredClass.baseClass) {
   registeredClass.baseClass.__derivedClasses ??= [];
   registeredClass.baseClass.__derivedClasses.push(registeredClass);
  }
  var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
  var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
  var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
  registeredPointers[rawType] = {
   pointerType: pointerConverter,
   constPointerType: constPointerConverter
  };
  replacePublicSymbol(legalFunctionName, constructor);
  return [ referenceConverter, pointerConverter, constPointerConverter ];
 });
};

var heap32VectorToArray = (count, firstElement) => {
 var array = [];
 for (var i = 0; i < count; i++) {
  array.push(SAFE_HEAP_LOAD((((firstElement) + (i * 4)) >> 2) * 4, 4, 1));
 }
 return array;
};

var runDestructors = destructors => {
 while (destructors.length) {
  var ptr = destructors.pop();
  var del = destructors.pop();
  del(ptr);
 }
};

function usesDestructorStack(argTypes) {
 for (var i = 1; i < argTypes.length; ++i) {
  if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
   return true;
  }
 }
 return false;
}

function newFunc(constructor, argumentList) {
 if (!(constructor instanceof Function)) {
  throw new TypeError(`new_ called with constructor type ${typeof (constructor)} which is not a function`);
 }
 /*
       * Previously, the following line was just:
       *   function dummy() {};
       * Unfortunately, Chrome was preserving 'dummy' as the object's name, even
       * though at creation, the 'dummy' has the correct constructor name.  Thus,
       * objects created with IMVU.new would show up in the debugger as 'dummy',
       * which isn't very helpful.  Using IMVU.createNamedFunction addresses the
       * issue.  Doubly-unfortunately, there's no way to write a test for this
       * behavior.  -NRD 2013.02.22
       */ var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {});
 dummy.prototype = constructor.prototype;
 var obj = new dummy;
 var r = constructor.apply(obj, argumentList);
 return (r instanceof Object) ? r : obj;
}

function createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync) {
 var needsDestructorStack = usesDestructorStack(argTypes);
 var argCount = argTypes.length;
 var argsList = "";
 var argsListWired = "";
 for (var i = 0; i < argCount - 2; ++i) {
  argsList += (i !== 0 ? ", " : "") + "arg" + i;
  argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
 }
 var invokerFnBody = `\n        return function (${argsList}) {\n        if (arguments.length !== ${argCount - 2}) {\n          throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${argCount - 2}');\n        }`;
 if (needsDestructorStack) {
  invokerFnBody += "var destructors = [];\n";
 }
 var dtorStack = needsDestructorStack ? "destructors" : "null";
 var args1 = [ "humanName", "throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam" ];
 if (isClassMethodFunc) {
  invokerFnBody += "var thisWired = classParam['toWireType'](" + dtorStack + ", this);\n";
 }
 for (var i = 0; i < argCount - 2; ++i) {
  invokerFnBody += "var arg" + i + "Wired = argType" + i + "['toWireType'](" + dtorStack + ", arg" + i + ");\n";
  args1.push("argType" + i);
 }
 if (isClassMethodFunc) {
  argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
 }
 invokerFnBody += (returns || isAsync ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
 var returnVal = returns ? "rv" : "";
 if (needsDestructorStack) {
  invokerFnBody += "runDestructors(destructors);\n";
 } else {
  for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
   var paramName = (i === 1 ? "thisWired" : ("arg" + (i - 2) + "Wired"));
   if (argTypes[i].destructorFunction !== null) {
    invokerFnBody += `${paramName}_dtor(${paramName});\n`;
    args1.push(`${paramName}_dtor`);
   }
  }
 }
 if (returns) {
  invokerFnBody += "var ret = retType['fromWireType'](rv);\n" + "return ret;\n";
 } else {}
 invokerFnBody += "}\n";
 invokerFnBody = `if (arguments.length !== ${args1.length}){ throw new Error(humanName + "Expected ${args1.length} closure arguments " + arguments.length + " given."); }\n${invokerFnBody}`;
 return [ args1, invokerFnBody ];
}

function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, /** boolean= */ isAsync) {
 var argCount = argTypes.length;
 if (argCount < 2) {
  throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
 }
 assert(!isAsync, "Async bindings are only supported with JSPI.");
 var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
 var needsDestructorStack = usesDestructorStack(argTypes);
 var returns = (argTypes[0].name !== "void");
 var closureArgs = [ humanName, throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1] ];
 for (var i = 0; i < argCount - 2; ++i) {
  closureArgs.push(argTypes[i + 2]);
 }
 if (!needsDestructorStack) {
  for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
   if (argTypes[i].destructorFunction !== null) {
    closureArgs.push(argTypes[i].destructorFunction);
   }
  }
 }
 let [args, invokerFnBody] = createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync);
 args.push(invokerFnBody);
 var invokerFn = newFunc(Function, args)(...closureArgs);
 return createNamedFunction(humanName, invokerFn);
}

var __embind_register_class_constructor = (rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) => {
 assert(argCount > 0);
 var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
 invoker = embind__requireFunction(invokerSignature, invoker);
 var args = [ rawConstructor ];
 var destructors = [];
 whenDependentTypesAreResolved([], [ rawClassType ], classType => {
  classType = classType[0];
  var humanName = `constructor ${classType.name}`;
  if (undefined === classType.registeredClass.constructor_body) {
   classType.registeredClass.constructor_body = [];
  }
  if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
   throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount - 1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
  }
  classType.registeredClass.constructor_body[argCount - 1] = () => {
   throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
  };
  whenDependentTypesAreResolved([], rawArgTypes, argTypes => {
   argTypes.splice(1, 0, null);
   classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
   return [];
  });
  return [];
 });
};

var getFunctionName = signature => {
 signature = signature.trim();
 const argsIndex = signature.indexOf("(");
 if (argsIndex !== -1) {
  assert(signature[signature.length - 1] == ")", "Parentheses for argument names should match.");
  return signature.substr(0, argsIndex);
 } else {
  return signature;
 }
};

var __embind_register_class_function = (rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual, isAsync) => {
 var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
 methodName = readLatin1String(methodName);
 methodName = getFunctionName(methodName);
 rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
 whenDependentTypesAreResolved([], [ rawClassType ], classType => {
  classType = classType[0];
  var humanName = `${classType.name}.${methodName}`;
  if (methodName.startsWith("@@")) {
   methodName = Symbol[methodName.substring(2)];
  }
  if (isPureVirtual) {
   classType.registeredClass.pureVirtualFunctions.push(methodName);
  }
  function unboundTypesHandler() {
   throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
  }
  var proto = classType.registeredClass.instancePrototype;
  var method = proto[methodName];
  if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)) {
   unboundTypesHandler.argCount = argCount - 2;
   unboundTypesHandler.className = classType.name;
   proto[methodName] = unboundTypesHandler;
  } else {
   ensureOverloadTable(proto, methodName, humanName);
   proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
  }
  whenDependentTypesAreResolved([], rawArgTypes, argTypes => {
   var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
   if (undefined === proto[methodName].overloadTable) {
    memberFunction.argCount = argCount - 2;
    proto[methodName] = memberFunction;
   } else {
    proto[methodName].overloadTable[argCount - 2] = memberFunction;
   }
   return [];
  });
  return [];
 });
};

var emval_freelist = [];

var emval_handles = [];

var __emval_decref = handle => {
 if (handle > 9 && 0 === --emval_handles[handle + 1]) {
  assert(emval_handles[handle] !== undefined, `Decref for unallocated handle.`);
  emval_handles[handle] = undefined;
  emval_freelist.push(handle);
 }
};

var count_emval_handles = () => emval_handles.length / 2 - 5 - emval_freelist.length;

var init_emval = () => {
 emval_handles.push(0, 1, undefined, 1, null, 1, true, 1, false, 1);
 assert(emval_handles.length === 5 * 2);
 Module["count_emval_handles"] = count_emval_handles;
};

var Emval = {
 toValue: handle => {
  if (!handle) {
   throwBindingError("Cannot use deleted val. handle = " + handle);
  }
  assert(handle === 2 || emval_handles[handle] !== undefined && handle % 2 === 0, `invalid handle: ${handle}`);
  return emval_handles[handle];
 },
 toHandle: value => {
  switch (value) {
  case undefined:
   return 2;

  case null:
   return 4;

  case true:
   return 6;

  case false:
   return 8;

  default:
   {
    const handle = emval_freelist.pop() || emval_handles.length;
    emval_handles[handle] = value;
    emval_handles[handle + 1] = 1;
    return handle;
   }
  }
 }
};

var EmValType = {
 name: "emscripten::val",
 "fromWireType": handle => {
  var rv = Emval.toValue(handle);
  __emval_decref(handle);
  return rv;
 },
 "toWireType": (destructors, value) => Emval.toHandle(value),
 "argPackAdvance": GenericWireTypeSize,
 "readValueFromPointer": readPointer,
 destructorFunction: null
};

var __embind_register_emval = rawType => registerType(rawType, EmValType);

var floatReadValueFromPointer = (name, width) => {
 switch (width) {
 case 4:
  return function(pointer) {
   return this["fromWireType"](SAFE_HEAP_LOAD_D(((pointer) >> 2) * 4, 4, 0));
  };

 case 8:
  return function(pointer) {
   return this["fromWireType"](SAFE_HEAP_LOAD_D(((pointer) >> 3) * 8, 8, 0));
  };

 default:
  throw new TypeError(`invalid float width (${width}): ${name}`);
 }
};

var __embind_register_float = (rawType, name, size) => {
 name = readLatin1String(name);
 registerType(rawType, {
  name: name,
  "fromWireType": value => value,
  "toWireType": (destructors, value) => {
   if (typeof value != "number" && typeof value != "boolean") {
    throw new TypeError(`Cannot convert ${embindRepr(value)} to ${this.name}`);
   }
   return value;
  },
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": floatReadValueFromPointer(name, size),
  destructorFunction: null
 });
};

var __embind_register_function = (name, argCount, rawArgTypesAddr, signature, rawInvoker, fn, isAsync) => {
 var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
 name = readLatin1String(name);
 name = getFunctionName(name);
 rawInvoker = embind__requireFunction(signature, rawInvoker);
 exposePublicSymbol(name, function() {
  throwUnboundTypeError(`Cannot call ${name} due to unbound types`, argTypes);
 }, argCount - 1);
 whenDependentTypesAreResolved([], argTypes, argTypes => {
  var invokerArgsArray = [ argTypes[0], /* return value */ null ].concat(/* no class 'this'*/ argTypes.slice(1));
  /* actual params */ replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, /* no class 'this'*/ rawInvoker, fn, isAsync), argCount - 1);
  return [];
 });
};

/** @suppress {globalThis} */ var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
 name = readLatin1String(name);
 if (maxRange === -1) {
  maxRange = 4294967295;
 }
 var fromWireType = value => value;
 if (minRange === 0) {
  var bitshift = 32 - 8 * size;
  fromWireType = value => (value << bitshift) >>> bitshift;
 }
 var isUnsignedType = (name.includes("unsigned"));
 var checkAssertions = (value, toTypeName) => {
  if (typeof value != "number" && typeof value != "boolean") {
   throw new TypeError(`Cannot convert "${embindRepr(value)}" to ${toTypeName}`);
  }
  if (value < minRange || value > maxRange) {
   throw new TypeError(`Passing a number "${embindRepr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`);
  }
 };
 var toWireType;
 if (isUnsignedType) {
  toWireType = function(destructors, value) {
   checkAssertions(value, this.name);
   return value >>> 0;
  };
 } else {
  toWireType = function(destructors, value) {
   checkAssertions(value, this.name);
   return value;
  };
 }
 registerType(primitiveType, {
  name: name,
  "fromWireType": fromWireType,
  "toWireType": toWireType,
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": integerReadValueFromPointer(name, size, minRange !== 0),
  destructorFunction: null
 });
};

var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
 var typeMapping = [ Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array ];
 var TA = typeMapping[dataTypeIndex];
 function decodeMemoryView(handle) {
  var size = SAFE_HEAP_LOAD(((handle) >> 2) * 4, 4, 1);
  var data = SAFE_HEAP_LOAD((((handle) + (4)) >> 2) * 4, 4, 1);
  return new TA(HEAP8.buffer, data, size);
 }
 name = readLatin1String(name);
 registerType(rawType, {
  name: name,
  "fromWireType": decodeMemoryView,
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": decodeMemoryView
 }, {
  ignoreDuplicateRegistrations: true
 });
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
 assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | (u1 & 1023);
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++] = 192 | (u >> 6);
   heap[outIdx++] = 128 | (u & 63);
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++] = 224 | (u >> 12);
   heap[outIdx++] = 128 | ((u >> 6) & 63);
   heap[outIdx++] = 128 | (u & 63);
  } else {
   if (outIdx + 3 >= endIdx) break;
   if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
   heap[outIdx++] = 240 | (u >> 18);
   heap[outIdx++] = 128 | ((u >> 12) & 63);
   heap[outIdx++] = 128 | ((u >> 6) & 63);
   heap[outIdx++] = 128 | (u & 63);
  }
 }
 heap[outIdx] = 0;
 return outIdx - startIdx;
};

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
 assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
};

var lengthBytesUTF8 = str => {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var c = str.charCodeAt(i);
  if (c <= 127) {
   len++;
  } else if (c <= 2047) {
   len += 2;
  } else if (c >= 55296 && c <= 57343) {
   len += 4;
   ++i;
  } else {
   len += 3;
  }
 }
 return len;
};

var __embind_register_std_string = (rawType, name) => {
 name = readLatin1String(name);
 var stdStringIsUTF8 =  (name === "std::string");
 registerType(rawType, {
  name: name,
  "fromWireType"(value) {
   var length = SAFE_HEAP_LOAD(((value) >> 2) * 4, 4, 1);
   var payload = value + 4;
   var str;
   if (stdStringIsUTF8) {
    var decodeStartPtr = payload;
    for (var i = 0; i <= length; ++i) {
     var currentBytePtr = payload + i;
     if (i == length || SAFE_HEAP_LOAD(currentBytePtr, 1, 1) == 0) {
      var maxRead = currentBytePtr - decodeStartPtr;
      var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
      if (str === undefined) {
       str = stringSegment;
      } else {
       str += String.fromCharCode(0);
       str += stringSegment;
      }
      decodeStartPtr = currentBytePtr + 1;
     }
    }
   } else {
    var a = new Array(length);
    for (var i = 0; i < length; ++i) {
     a[i] = String.fromCharCode(SAFE_HEAP_LOAD(payload + i, 1, 1));
    }
    str = a.join("");
   }
   _free(value);
   return str;
  },
  "toWireType"(destructors, value) {
   if (value instanceof ArrayBuffer) {
    value = new Uint8Array(value);
   }
   var length;
   var valueIsOfTypeString = (typeof value == "string");
   if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
    throwBindingError("Cannot pass non-string to std::string");
   }
   if (stdStringIsUTF8 && valueIsOfTypeString) {
    length = lengthBytesUTF8(value);
   } else {
    length = value.length;
   }
   var base = _malloc(4 + length + 1);
   var ptr = base + 4;
   SAFE_HEAP_STORE(((base) >> 2) * 4, length, 4);
   checkInt32(length);
   if (stdStringIsUTF8 && valueIsOfTypeString) {
    stringToUTF8(value, ptr, length + 1);
   } else {
    if (valueIsOfTypeString) {
     for (var i = 0; i < length; ++i) {
      var charCode = value.charCodeAt(i);
      if (charCode > 255) {
       _free(ptr);
       throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
      }
      SAFE_HEAP_STORE(ptr + i, charCode, 1);
     }
    } else {
     for (var i = 0; i < length; ++i) {
      SAFE_HEAP_STORE(ptr + i, value[i], 1);
     }
    }
   }
   if (destructors !== null) {
    destructors.push(_free, base);
   }
   return base;
  },
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": readPointer,
  destructorFunction(ptr) {
   _free(ptr);
  }
 });
};

var UTF16Decoder = new TextDecoder("utf-16le");

var UTF16ToString = (ptr, maxBytesToRead) => {
 assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
 var endPtr = ptr;
 var idx = endPtr >> 1;
 var maxIdx = idx + maxBytesToRead / 2;
 while (!(idx >= maxIdx) && SAFE_HEAP_LOAD(idx * 2, 2, 1)) ++idx;
 endPtr = idx << 1;
 return UTF16Decoder.decode(HEAPU8.slice(ptr, endPtr));
};

var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
 assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
 assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 maxBytesToWrite ??= 2147483647;
 if (maxBytesToWrite < 2) return 0;
 maxBytesToWrite -= 2;
 var startPtr = outPtr;
 var numCharsToWrite = (maxBytesToWrite < str.length * 2) ? (maxBytesToWrite / 2) : str.length;
 for (var i = 0; i < numCharsToWrite; ++i) {
  var codeUnit = str.charCodeAt(i);
  SAFE_HEAP_STORE(((outPtr) >> 1) * 2, codeUnit, 2);
  checkInt16(codeUnit);
  outPtr += 2;
 }
 SAFE_HEAP_STORE(((outPtr) >> 1) * 2, 0, 2);
 checkInt16(0);
 return outPtr - startPtr;
};

var lengthBytesUTF16 = str => str.length * 2;

var UTF32ToString = (ptr, maxBytesToRead) => {
 assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
 var i = 0;
 var str = "";
 while (!(i >= maxBytesToRead / 4)) {
  var utf32 = SAFE_HEAP_LOAD((((ptr) + (i * 4)) >> 2) * 4, 4, 0);
  if (utf32 == 0) break;
  ++i;
  if (utf32 >= 65536) {
   var ch = utf32 - 65536;
   str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
  } else {
   str += String.fromCharCode(utf32);
  }
 }
 return str;
};

var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
 assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
 assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
 maxBytesToWrite ??= 2147483647;
 if (maxBytesToWrite < 4) return 0;
 var startPtr = outPtr;
 var endPtr = startPtr + maxBytesToWrite - 4;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) {
   var trailSurrogate = str.charCodeAt(++i);
   codeUnit = 65536 + ((codeUnit & 1023) << 10) | (trailSurrogate & 1023);
  }
  SAFE_HEAP_STORE(((outPtr) >> 2) * 4, codeUnit, 4);
  checkInt32(codeUnit);
  outPtr += 4;
  if (outPtr + 4 > endPtr) break;
 }
 SAFE_HEAP_STORE(((outPtr) >> 2) * 4, 0, 4);
 checkInt32(0);
 return outPtr - startPtr;
};

var lengthBytesUTF32 = str => {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var codeUnit = str.charCodeAt(i);
  if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
  len += 4;
 }
 return len;
};

var __embind_register_std_wstring = (rawType, charSize, name) => {
 name = readLatin1String(name);
 var decodeString, encodeString, readCharAt, lengthBytesUTF;
 if (charSize === 2) {
  decodeString = UTF16ToString;
  encodeString = stringToUTF16;
  lengthBytesUTF = lengthBytesUTF16;
  readCharAt = pointer => SAFE_HEAP_LOAD(((pointer) >> 1) * 2, 2, 1);
 } else if (charSize === 4) {
  decodeString = UTF32ToString;
  encodeString = stringToUTF32;
  lengthBytesUTF = lengthBytesUTF32;
  readCharAt = pointer => SAFE_HEAP_LOAD(((pointer) >> 2) * 4, 4, 1);
 }
 registerType(rawType, {
  name: name,
  "fromWireType": value => {
   var length = SAFE_HEAP_LOAD(((value) >> 2) * 4, 4, 1);
   var str;
   var decodeStartPtr = value + 4;
   for (var i = 0; i <= length; ++i) {
    var currentBytePtr = value + 4 + i * charSize;
    if (i == length || readCharAt(currentBytePtr) == 0) {
     var maxReadBytes = currentBytePtr - decodeStartPtr;
     var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
     if (str === undefined) {
      str = stringSegment;
     } else {
      str += String.fromCharCode(0);
      str += stringSegment;
     }
     decodeStartPtr = currentBytePtr + charSize;
    }
   }
   _free(value);
   return str;
  },
  "toWireType": (destructors, value) => {
   if (!(typeof value == "string")) {
    throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
   }
   var length = lengthBytesUTF(value);
   var ptr = _malloc(4 + length + charSize);
   SAFE_HEAP_STORE(((ptr) >> 2) * 4, length / charSize, 4);
   checkInt32(length / charSize);
   encodeString(value, ptr + 4, length + charSize);
   if (destructors !== null) {
    destructors.push(_free, ptr);
   }
   return ptr;
  },
  "argPackAdvance": GenericWireTypeSize,
  "readValueFromPointer": readPointer,
  destructorFunction(ptr) {
   _free(ptr);
  }
 });
};

var __embind_register_void = (rawType, name) => {
 name = readLatin1String(name);
 registerType(rawType, {
  isVoid: true,
  name: name,
  "argPackAdvance": 0,
  "fromWireType": () => undefined,
  "toWireType": (destructors, o) => undefined
 });
};

var nowIsMonotonic = 1;

var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

var maybeExit = () => {
 dbg(`maybeExit: user callback done: runtimeKeepaliveCounter=${runtimeKeepaliveCounter}`);
 if (!keepRuntimeAlive()) {
  dbg(`maybeExit: calling exit() implicitly after user callback completed: ${EXITSTATUS}`);
  try {
   if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS); else _exit(EXITSTATUS);
  } catch (e) {
   handleException(e);
  }
 }
};

var callUserCallback = func => {
 if (ABORT) {
  err("user callback triggered after runtime exited or application aborted.  Ignoring.");
  return;
 }
 try {
  func();
  maybeExit();
 } catch (e) {
  handleException(e);
 }
};

var __emscripten_thread_mailbox_await = pthread_ptr => {
 if (typeof Atomics.waitAsync === "function") {
  var wait = Atomics.waitAsync(HEAP32, ((pthread_ptr) >> 2), pthread_ptr);
  assert(wait.async);
  wait.value.then(checkMailbox);
  var waitingAsync = pthread_ptr + 128;
  Atomics.store(HEAP32, ((waitingAsync) >> 2), 1);
 }
};

Module["__emscripten_thread_mailbox_await"] = __emscripten_thread_mailbox_await;

var checkMailbox = () => {
 var pthread_ptr = _pthread_self();
 if (pthread_ptr) {
  __emscripten_thread_mailbox_await(pthread_ptr);
  callUserCallback(__emscripten_check_mailbox);
 }
};

Module["checkMailbox"] = checkMailbox;

var __emscripten_notify_mailbox_postmessage = (targetThreadId, currThreadId, mainThreadId) => {
 if (targetThreadId == currThreadId) {
  setTimeout(checkMailbox);
 } else if (ENVIRONMENT_IS_PTHREAD) {
  postMessage({
   "targetThread": targetThreadId,
   "cmd": "checkMailbox"
  });
 } else {
  var worker = PThread.pthreads[targetThreadId];
  if (!worker) {
   err(`Cannot send message to thread with ID ${targetThreadId}, unknown thread ID!`);
   return;
  }
  worker.postMessage({
   "cmd": "checkMailbox"
  });
 }
};

var proxiedJSCallArgs = [];

var __emscripten_receive_on_main_thread_js = (funcIndex, emAsmAddr, callingThread, numCallArgs, args) => {
 numCallArgs /= 2;
 proxiedJSCallArgs.length = numCallArgs;
 var b = ((args) >> 3);
 for (var i = 0; i < numCallArgs; i++) {
  if (HEAP64[b + 2 * i]) {
   proxiedJSCallArgs[i] = HEAP64[b + 2 * i + 1];
  } else {
   proxiedJSCallArgs[i] = SAFE_HEAP_LOAD_D((b + 2 * i + 1) * 8, 8, 0);
  }
 }
 var func = emAsmAddr ? ASM_CONSTS[emAsmAddr] : proxiedFunctionTable[funcIndex];
 assert(!(funcIndex && emAsmAddr));
 assert(func.length == numCallArgs, "Call args mismatch in _emscripten_receive_on_main_thread_js");
 PThread.currentProxiedOperationCallerThread = callingThread;
 var rtn = func(...proxiedJSCallArgs);
 PThread.currentProxiedOperationCallerThread = 0;
 assert(typeof rtn != "bigint");
 return rtn;
};

/** @suppress{checkTypes} */ var withBuiltinMalloc = func => {
 var prev_malloc = typeof _malloc != "undefined" ? _malloc : undefined;
 var prev_memalign = typeof _memalign != "undefined" ? _memalign : undefined;
 var prev_free = typeof _free != "undefined" ? _free : undefined;
 _malloc = _emscripten_builtin_malloc;
 _memalign = _emscripten_builtin_memalign;
 _free = _emscripten_builtin_free;
 try {
  return func();
 } finally {
  _malloc = prev_malloc;
  _memalign = prev_memalign;
  _free = prev_free;
 }
};

var stringToNewUTF8 = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8(str, ret, size);
 return ret;
};

var __emscripten_sanitizer_get_option = name => withBuiltinMalloc(() => stringToNewUTF8(Module[UTF8ToString(name)] || ""));

var __emscripten_sanitizer_use_colors = () => {
 var setting = Module["printWithColors"];
 if (setting !== undefined) {
  return setting;
 }
 return ENVIRONMENT_IS_NODE && process.stderr.isTTY;
};

var __emscripten_thread_set_strongref = thread => {};

var __wasmfs_copy_preloaded_file_data = (index, buffer) => HEAPU8.set(wasmFSPreloadedFiles[index].fileData, buffer);

var wasmFSPreloadedDirs = [];

var __wasmfs_get_num_preloaded_dirs = () => wasmFSPreloadedDirs.length;

var wasmFSPreloadedFiles = [];

var wasmFSPreloadingFlushed = false;

var __wasmfs_get_num_preloaded_files = () => {
 wasmFSPreloadingFlushed = true;
 return wasmFSPreloadedFiles.length;
};

var __wasmfs_get_preloaded_child_path = (index, childNameBuffer) => {
 var s = wasmFSPreloadedDirs[index].childName;
 var len = lengthBytesUTF8(s) + 1;
 stringToUTF8(s, childNameBuffer, len);
};

var __wasmfs_get_preloaded_file_mode = index => wasmFSPreloadedFiles[index].mode;

var __wasmfs_get_preloaded_file_size = index => wasmFSPreloadedFiles[index].fileData.length;

var __wasmfs_get_preloaded_parent_path = (index, parentPathBuffer) => {
 var s = wasmFSPreloadedDirs[index].parentPath;
 var len = lengthBytesUTF8(s) + 1;
 stringToUTF8(s, parentPathBuffer, len);
};

var __wasmfs_get_preloaded_path_name = (index, fileNameBuffer) => {
 var s = wasmFSPreloadedFiles[index].pathName;
 var len = lengthBytesUTF8(s) + 1;
 stringToUTF8(s, fileNameBuffer, len);
};

class HandleAllocator {
 constructor() {
  this.allocated = [ undefined ];
  this.freelist = [];
 }
 get(id) {
  assert(this.allocated[id] !== undefined, `invalid handle: ${id}`);
  return this.allocated[id];
 }
 has(id) {
  return this.allocated[id] !== undefined;
 }
 allocate(handle) {
  var id = this.freelist.pop() || this.allocated.length;
  this.allocated[id] = handle;
  return id;
 }
 free(id) {
  assert(this.allocated[id] !== undefined);
  this.allocated[id] = undefined;
  this.freelist.push(id);
 }
}

var wasmfsOPFSAccessHandles = new HandleAllocator;

var wasmfsOPFSProxyFinish = ctx => {
 _emscripten_proxy_finish(ctx);
};

async function __wasmfs_opfs_close_access(ctx, accessID, errPtr) {
 let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
 try {
  await accessHandle.close();
 } catch {
  let err = -29;
  SAFE_HEAP_STORE(((errPtr) >> 2) * 4, err, 4);
  checkInt32(err);
 }
 wasmfsOPFSAccessHandles.free(accessID);
 wasmfsOPFSProxyFinish(ctx);
}

var wasmfsOPFSBlobs = new HandleAllocator;

var __wasmfs_opfs_close_blob = blobID => {
 wasmfsOPFSBlobs.free(blobID);
};

async function __wasmfs_opfs_flush_access(ctx, accessID, errPtr) {
 let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
 try {
  await accessHandle.flush();
 } catch {
  let err = -29;
  SAFE_HEAP_STORE(((errPtr) >> 2) * 4, err, 4);
  checkInt32(err);
 }
 wasmfsOPFSProxyFinish(ctx);
}

var wasmfsOPFSDirectoryHandles = new HandleAllocator;

var __wasmfs_opfs_free_directory = dirID => {
 wasmfsOPFSDirectoryHandles.free(dirID);
};

var wasmfsOPFSFileHandles = new HandleAllocator;

var __wasmfs_opfs_free_file = fileID => {
 wasmfsOPFSFileHandles.free(fileID);
};

async function wasmfsOPFSGetOrCreateFile(parent, name, create) {
 let parentHandle = wasmfsOPFSDirectoryHandles.get(parent);
 let fileHandle;
 try {
  fileHandle = await parentHandle.getFileHandle(name, {
   create: create
  });
 } catch (e) {
  if (e.name === "NotFoundError") {
   return -20;
  }
  if (e.name === "TypeMismatchError") {
   return -31;
  }
  err("unexpected error:", e, e.stack);
  return -29;
 }
 return wasmfsOPFSFileHandles.allocate(fileHandle);
}

async function wasmfsOPFSGetOrCreateDir(parent, name, create) {
 let parentHandle = wasmfsOPFSDirectoryHandles.get(parent);
 let childHandle;
 try {
  childHandle = await parentHandle.getDirectoryHandle(name, {
   create: create
  });
 } catch (e) {
  if (e.name === "NotFoundError") {
   return -20;
  }
  if (e.name === "TypeMismatchError") {
   return -54;
  }
  err("unexpected error:", e, e.stack);
  return -29;
 }
 return wasmfsOPFSDirectoryHandles.allocate(childHandle);
}

async function __wasmfs_opfs_get_child(ctx, parent, namePtr, childTypePtr, childIDPtr) {
 let name = UTF8ToString(namePtr);
 let childType = 1;
 let childID = await wasmfsOPFSGetOrCreateFile(parent, name, false);
 if (childID == -31) {
  childType = 2;
  childID = await wasmfsOPFSGetOrCreateDir(parent, name, false);
 }
 SAFE_HEAP_STORE(((childTypePtr) >> 2) * 4, childType, 4);
 checkInt32(childType);
 SAFE_HEAP_STORE(((childIDPtr) >> 2) * 4, childID, 4);
 checkInt32(childID);
 wasmfsOPFSProxyFinish(ctx);
}

var __wasmfs_opfs_get_entries = async function(ctx, dirID, entriesPtr, errPtr) {
 let dirHandle = wasmfsOPFSDirectoryHandles.get(dirID);
 try {
  let iter = dirHandle.entries();
  for (let entry; entry = await iter.next(), !entry.done; ) {
   let [name, child] = entry.value;
   withStackSave(() => {
    let namePtr = stringToUTF8OnStack(name);
    let type = child.kind == "file" ? 1 : 2;
    __wasmfs_opfs_record_entry(entriesPtr, namePtr, type);
   });
  }
 } catch {
  let err = -29;
  SAFE_HEAP_STORE(((errPtr) >> 2) * 4, err, 4);
  checkInt32(err);
 }
 wasmfsOPFSProxyFinish(ctx);
};

async function __wasmfs_opfs_get_size_access(ctx, accessID, sizePtr) {
 let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
 let size;
 try {
  size = await accessHandle.getSize();
 } catch {
  size = -29;
 }
 HEAP64[((sizePtr) >> 3)] = BigInt(size);
 checkInt64(size);
 wasmfsOPFSProxyFinish(ctx);
}

var __wasmfs_opfs_get_size_blob = blobID => wasmfsOPFSBlobs.get(blobID).size;

async function __wasmfs_opfs_get_size_file(ctx, fileID, sizePtr) {
 let fileHandle = wasmfsOPFSFileHandles.get(fileID);
 let size;
 try {
  size = (await fileHandle.getFile()).size;
 } catch {
  size = -29;
 }
 HEAP64[((sizePtr) >> 3)] = BigInt(size);
 checkInt64(size);
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_init_root_directory(ctx) {
 if (wasmfsOPFSDirectoryHandles.allocated.length == 1) {
  /** @suppress {checkTypes} */ let root = await navigator.storage.getDirectory();
  wasmfsOPFSDirectoryHandles.allocated.push(root);
 }
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_insert_directory(ctx, parent, namePtr, childIDPtr) {
 let name = UTF8ToString(namePtr);
 let childID = await wasmfsOPFSGetOrCreateDir(parent, name, true);
 SAFE_HEAP_STORE(((childIDPtr) >> 2) * 4, childID, 4);
 checkInt32(childID);
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_insert_file(ctx, parent, namePtr, childIDPtr) {
 let name = UTF8ToString(namePtr);
 let childID = await wasmfsOPFSGetOrCreateFile(parent, name, true);
 SAFE_HEAP_STORE(((childIDPtr) >> 2) * 4, childID, 4);
 checkInt32(childID);
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_move_file(ctx, fileID, newParentID, namePtr, errPtr) {
 let name = UTF8ToString(namePtr);
 let fileHandle = wasmfsOPFSFileHandles.get(fileID);
 let newDirHandle = wasmfsOPFSDirectoryHandles.get(newParentID);
 try {
  await fileHandle.move(newDirHandle, name);
 } catch {
  let err = -29;
  SAFE_HEAP_STORE(((errPtr) >> 2) * 4, err, 4);
  checkInt32(err);
 }
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_open_access(ctx, fileID, accessIDPtr) {
 let fileHandle = wasmfsOPFSFileHandles.get(fileID);
 let accessID;
 try {
  let accessHandle;
  /** @suppress {checkTypes} */ var len = FileSystemFileHandle.prototype.createSyncAccessHandle.length;
  if (len == 0) {
   accessHandle = await fileHandle.createSyncAccessHandle();
  } else {
   accessHandle = await fileHandle.createSyncAccessHandle({
    mode: "in-place"
   });
  }
  accessID = wasmfsOPFSAccessHandles.allocate(accessHandle);
 } catch (e) {
  if (e.name === "InvalidStateError" || e.name === "NoModificationAllowedError") {
   accessID = -2;
  } else {
   err("unexpected error:", e, e.stack);
   accessID = -29;
  }
 }
 SAFE_HEAP_STORE(((accessIDPtr) >> 2) * 4, accessID, 4);
 checkInt32(accessID);
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_open_blob(ctx, fileID, blobIDPtr) {
 let fileHandle = wasmfsOPFSFileHandles.get(fileID);
 let blobID;
 try {
  let blob = await fileHandle.getFile();
  blobID = wasmfsOPFSBlobs.allocate(blob);
 } catch (e) {
  if (e.name === "NotAllowedError") {
   blobID = -2;
  } else {
   err("unexpected error:", e, e.stack);
   blobID = -29;
  }
 }
 SAFE_HEAP_STORE(((blobIDPtr) >> 2) * 4, blobID, 4);
 checkInt32(blobID);
 wasmfsOPFSProxyFinish(ctx);
}

function __wasmfs_opfs_read_access(accessID, bufPtr, len, pos) {
 let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
 let data = HEAPU8.subarray(bufPtr, bufPtr + len);
 try {
  return accessHandle.read(data, {
   at: pos
  });
 } catch (e) {
  if (e.name == "TypeError") {
   return -28;
  }
  err("unexpected error:", e, e.stack);
  return -29;
 }
}

async function __wasmfs_opfs_read_blob(ctx, blobID, bufPtr, len, pos, nreadPtr) {
 let blob = wasmfsOPFSBlobs.get(blobID);
 let slice = blob.slice(pos, pos + len);
 let nread = 0;
 try {
  let buf = await slice.arrayBuffer();
  let data = new Uint8Array(buf);
  HEAPU8.set(data, bufPtr);
  nread += data.length;
 } catch (e) {
  if (e instanceof RangeError) {
   nread = -21;
  } else {
   err("unexpected error:", e, e.stack);
   nread = -29;
  }
 }
 SAFE_HEAP_STORE(((nreadPtr) >> 2) * 4, nread, 4);
 checkInt32(nread);
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_remove_child(ctx, dirID, namePtr, errPtr) {
 let name = UTF8ToString(namePtr);
 let dirHandle = wasmfsOPFSDirectoryHandles.get(dirID);
 try {
  await dirHandle.removeEntry(name);
 } catch {
  let err = -29;
  SAFE_HEAP_STORE(((errPtr) >> 2) * 4, err, 4);
  checkInt32(err);
 }
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_set_size_access(ctx, accessID, size, errPtr) {
 size = bigintToI53Checked(size);
 let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
 try {
  await accessHandle.truncate(size);
 } catch {
  let err = -29;
  SAFE_HEAP_STORE(((errPtr) >> 2) * 4, err, 4);
  checkInt32(err);
 }
 wasmfsOPFSProxyFinish(ctx);
}

async function __wasmfs_opfs_set_size_file(ctx, fileID, size, errPtr) {
 size = bigintToI53Checked(size);
 let fileHandle = wasmfsOPFSFileHandles.get(fileID);
 try {
  let writable = await fileHandle.createWritable({
   keepExistingData: true
  });
  await writable.truncate(size);
  await writable.close();
 } catch {
  let err = -29;
  SAFE_HEAP_STORE(((errPtr) >> 2) * 4, err, 4);
  checkInt32(err);
 }
 wasmfsOPFSProxyFinish(ctx);
}

function __wasmfs_opfs_write_access(accessID, bufPtr, len, pos) {
 let accessHandle = wasmfsOPFSAccessHandles.get(accessID);
 let data = HEAPU8.subarray(bufPtr, bufPtr + len);
 try {
  return accessHandle.write(data, {
   at: pos
  });
 } catch (e) {
  if (e.name == "TypeError") {
   return -28;
  }
  err("unexpected error:", e, e.stack);
  return -29;
 }
}

var FS_stdin_getChar_buffer = [];

/** @type {function(string, boolean=, number=)} */ function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

var FS_stdin_getChar = () => {
 if (!FS_stdin_getChar_buffer.length) {
  var result = null;
  if (typeof window != "undefined" && typeof window.prompt == "function") {
   result = window.prompt("Input: ");
   if (result !== null) {
    result += "\n";
   }
  } else if (typeof readline == "function") {
   result = readline();
   if (result !== null) {
    result += "\n";
   }
  }
  if (!result) {
   return null;
  }
  FS_stdin_getChar_buffer = intArrayFromString(result, true);
 }
 return FS_stdin_getChar_buffer.shift();
};

var __wasmfs_stdin_get_char = () => {
 var c = FS_stdin_getChar();
 if (typeof c === "number") {
  return c;
 }
 return -1;
};

var __wasmfs_thread_utils_heartbeat = queue => {
 var intervalID = setInterval(() => {
  if (ABORT) {
   clearInterval(intervalID);
  } else {
   _emscripten_proxy_execute_queue(queue);
  }
 }, 50);
};

var _abort = () => {
 abort("native code called abort()");
};

var readEmAsmArgsArray = [];

var readEmAsmArgs = (sigPtr, buf) => {
 assert(Array.isArray(readEmAsmArgsArray));
 assert(buf % 16 == 0);
 readEmAsmArgsArray.length = 0;
 var ch;
 while (ch = SAFE_HEAP_LOAD(sigPtr++, 1, 1)) {
  var chr = String.fromCharCode(ch);
  var validChars = [ "d", "f", "i", "p" ];
  validChars.push("j");
  assert(validChars.includes(chr), `Invalid character ${ch}("${chr}") in readEmAsmArgs! Use only [${validChars}], and do not specify "v" for void return argument.`);
  var wide = (ch != 105);
  wide &= (ch != 112);
  buf += wide && (buf % 8) ? 4 : 0;
  readEmAsmArgsArray.push( ch == 112 ? SAFE_HEAP_LOAD(((buf) >> 2) * 4, 4, 1) : ch == 106 ? HEAP64[((buf) >> 3)] : ch == 105 ? SAFE_HEAP_LOAD(((buf) >> 2) * 4, 4, 0) : SAFE_HEAP_LOAD_D(((buf) >> 3) * 8, 8, 0));
  buf += wide ? 8 : 4;
 }
 return readEmAsmArgsArray;
};

var runEmAsmFunction = (code, sigPtr, argbuf) => {
 var args = readEmAsmArgs(sigPtr, argbuf);
 assert(ASM_CONSTS.hasOwnProperty(code), `No EM_ASM constant found at address ${code}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
 return ASM_CONSTS[code](...args);
};

var _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);

var _emscripten_check_blocking_allowed = () => {
 if (ENVIRONMENT_IS_WORKER) return;
 warnOnce("Blocking on the main thread is very dangerous, see https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread");
};

var _emscripten_console_error = str => {
 assert(typeof str == "number");
 console.error(UTF8ToString(str));
};

var _emscripten_console_log = str => {
 assert(typeof str == "number");
 console.log(UTF8ToString(str));
};

var _emscripten_console_warn = str => {
 assert(typeof str == "number");
 console.warn(UTF8ToString(str));
};

var _emscripten_date_now = () => Date.now();

var _emscripten_err = str => err(UTF8ToString(str));

var runtimeKeepalivePush = () => {
 runtimeKeepaliveCounter += 1;
 dbg(`runtimeKeepalivePush -> counter=${runtimeKeepaliveCounter}`);
};

var _emscripten_exit_with_live_runtime = () => {
 runtimeKeepalivePush();
 throw "unwind";
};

var getHeapMax = () => HEAPU8.length;

var _emscripten_get_heap_max = () => getHeapMax();

var _emscripten_get_module_name = (buf, length) => stringToUTF8(wasmBinaryFile, buf, length);

var _emscripten_get_now;

_emscripten_get_now = () => performance.timeOrigin + performance.now();

var _emscripten_has_asyncify = () => 0;

var _emscripten_num_logical_cores = () => navigator["hardwareConcurrency"];

var _emscripten_out = str => out(UTF8ToString(str));

var UNWIND_CACHE = {};

/** @returns {number} */ var convertFrameToPC = frame => {
 assert(wasmOffsetConverter);
 var match;
 if (match = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(frame)) {
  return +match[1];
 } else if (match = /\bwasm-function\[(\d+)\]:(\d+)/.exec(frame)) {
  return wasmOffsetConverter.convert(+match[1], +match[2]);
 } else if (match = /:(\d+):\d+(?:\)|$)/.exec(frame)) {
  return 2147483648 | +match[1];
 }
 return 0;
};

var convertPCtoSourceLocation = pc => {
 if (UNWIND_CACHE.last_get_source_pc == pc) return UNWIND_CACHE.last_source;
 var match;
 var source;
 if (!source) {
  var frame = UNWIND_CACHE[pc];
  if (!frame) return null;
  if (match = /\((.*):(\d+):(\d+)\)$/.exec(frame)) {
   source = {
    file: match[1],
    line: match[2],
    column: match[3]
   };
  } else  if (match = /@(.*):(\d+):(\d+)/.exec(frame)) {
   source = {
    file: match[1],
    line: match[2],
    column: match[3]
   };
  }
 }
 UNWIND_CACHE.last_get_source_pc = pc;
 UNWIND_CACHE.last_source = source;
 return source;
};

var _emscripten_pc_get_column = pc => {
 var result = convertPCtoSourceLocation(pc);
 return result ? result.column || 0 : 0;
};

var _emscripten_pc_get_file = pc => withBuiltinMalloc(() => {
 var result = convertPCtoSourceLocation(pc);
 if (!result) return 0;
 if (_emscripten_pc_get_file.ret) _free(_emscripten_pc_get_file.ret);
 _emscripten_pc_get_file.ret = stringToNewUTF8(result.file);
 return _emscripten_pc_get_file.ret;
});

var _emscripten_pc_get_function = pc => withBuiltinMalloc(() => {
 var name;
 if (pc & 2147483648) {
  var frame = UNWIND_CACHE[pc];
  if (!frame) return 0;
  var match;
  if (match = /^\s+at (.*) \(.*\)$/.exec(frame)) {
   name = match[1];
  } else if (match = /^(.+?)@/.exec(frame)) {
   name = match[1];
  } else {
   return 0;
  }
 } else {
  name = wasmOffsetConverter.getName(pc);
 }
 if (_emscripten_pc_get_function.ret) _free(_emscripten_pc_get_function.ret);
 _emscripten_pc_get_function.ret = stringToNewUTF8(name);
 return _emscripten_pc_get_function.ret;
});

var _emscripten_pc_get_line = pc => {
 var result = convertPCtoSourceLocation(pc);
 return result ? result.line : 0;
};

var abortOnCannotGrowMemory = requestedSize => {
 abort(`Cannot enlarge memory arrays to size ${requestedSize} bytes (OOM). Either (1) compile with -sINITIAL_MEMORY=X with X higher than the current value ${HEAP8.length}, (2) compile with -sALLOW_MEMORY_GROWTH which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with -sABORTING_MALLOC=0`);
};

var _emscripten_resize_heap = requestedSize => {
 var oldSize = HEAPU8.length;
 requestedSize >>>= 0;
 abortOnCannotGrowMemory(requestedSize);
};

function jsStackTrace() {
 return (new Error).stack.toString();
}

var _emscripten_return_address = level => {
 var callstack = jsStackTrace().split("\n");
 if (callstack[0] == "Error") {
  callstack.shift();
 }
 var caller = callstack[level + 3];
 return convertFrameToPC(caller);
};

var saveInUnwindCache = callstack => {
 callstack.forEach(frame => {
  var pc = convertFrameToPC(frame);
  if (pc) {
   UNWIND_CACHE[pc] = frame;
  }
 });
};

var _emscripten_stack_unwind_buffer = (addr, buffer, count) => {
 var stack;
 if (UNWIND_CACHE.last_addr == addr) {
  stack = UNWIND_CACHE.last_stack;
 } else {
  stack = jsStackTrace().split("\n");
  if (stack[0] == "Error") {
   stack.shift();
  }
  saveInUnwindCache(stack);
 }
 var offset = 3;
 while (stack[offset] && convertFrameToPC(stack[offset]) != addr) {
  ++offset;
 }
 for (var i = 0; i < count && stack[i + offset]; ++i) {
  SAFE_HEAP_STORE((((buffer) + (i * 4)) >> 2) * 4, convertFrameToPC(stack[i + offset]), 4);
  checkInt32(convertFrameToPC(stack[i + offset]));
 }
 return i;
};

var _emscripten_unwind_to_js_event_loop = () => {
 throw "unwind";
};

var ENV = {};

var getExecutableName = () => thisProgram || "./this.program";

var getEnvStrings = () => {
 if (!getEnvStrings.strings) {
  var lang = ((typeof navigator == "object" && navigator.languages && navigator.languages[0]) || "C").replace("-", "_") + ".UTF-8";
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": lang,
   "_": getExecutableName()
  };
  for (var x in ENV) {
   if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(`${x}=${env[x]}`);
  }
  getEnvStrings.strings = strings;
 }
 return getEnvStrings.strings;
};

var stringToAscii = (str, buffer) => {
 for (var i = 0; i < str.length; ++i) {
  assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
  SAFE_HEAP_STORE(buffer++, str.charCodeAt(i), 1);
  checkInt8(str.charCodeAt(i));
 }
 SAFE_HEAP_STORE(buffer, 0, 1);
 checkInt8(0);
};

var _environ_get = function(__environ, environ_buf) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(3, 0, 1, __environ, environ_buf);
 var bufSize = 0;
 getEnvStrings().forEach((string, i) => {
  var ptr = environ_buf + bufSize;
  SAFE_HEAP_STORE((((__environ) + (i * 4)) >> 2) * 4, ptr, 4);
  checkInt32(ptr);
  stringToAscii(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
};

var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
 if (ENVIRONMENT_IS_PTHREAD) return proxyToMainThread(4, 0, 1, penviron_count, penviron_buf_size);
 var strings = getEnvStrings();
 SAFE_HEAP_STORE(((penviron_count) >> 2) * 4, strings.length, 4);
 checkInt32(strings.length);
 var bufSize = 0;
 strings.forEach(string => bufSize += string.length + 1);
 SAFE_HEAP_STORE(((penviron_buf_size) >> 2) * 4, bufSize, 4);
 checkInt32(bufSize);
 return 0;
};

var initRandomFill = () => {
 if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
  return view => (view.set(crypto.getRandomValues(new Uint8Array(view.byteLength))), 
  view);
 } else  abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: (array) => { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
};

var randomFill = view => (randomFill = initRandomFill())(view);

var _getentropy = (buffer, size) => {
 randomFill(HEAPU8.subarray(buffer, buffer + size));
 return 0;
};

var isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

var arraySum = (array, index) => {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) {}
 return sum;
};

var MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var addDays = (date, days) => {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= (daysInCurrentMonth - newDate.getDate() + 1);
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
};

var writeArrayToMemory = (array, buffer) => {
 assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
 HEAP8.set(array, buffer);
};

var _strftime = (s, maxsize, format, tm) => {
 var tm_zone = SAFE_HEAP_LOAD((((tm) + (40)) >> 2) * 4, 4, 1);
 var date = {
  tm_sec: SAFE_HEAP_LOAD(((tm) >> 2) * 4, 4, 0),
  tm_min: SAFE_HEAP_LOAD((((tm) + (4)) >> 2) * 4, 4, 0),
  tm_hour: SAFE_HEAP_LOAD((((tm) + (8)) >> 2) * 4, 4, 0),
  tm_mday: SAFE_HEAP_LOAD((((tm) + (12)) >> 2) * 4, 4, 0),
  tm_mon: SAFE_HEAP_LOAD((((tm) + (16)) >> 2) * 4, 4, 0),
  tm_year: SAFE_HEAP_LOAD((((tm) + (20)) >> 2) * 4, 4, 0),
  tm_wday: SAFE_HEAP_LOAD((((tm) + (24)) >> 2) * 4, 4, 0),
  tm_yday: SAFE_HEAP_LOAD((((tm) + (28)) >> 2) * 4, 4, 0),
  tm_isdst: SAFE_HEAP_LOAD((((tm) + (32)) >> 2) * 4, 4, 0),
  tm_gmtoff: SAFE_HEAP_LOAD((((tm) + (36)) >> 2) * 4, 4, 0),
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value == "number" ? value.toString() : (value || "");
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : (value > 0 ? 1 : 0);
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   }
   return thisDate.getFullYear();
  }
  return thisDate.getFullYear() - 1;
 }
 var EXPANSION_RULES_2 = {
  "%a": date => WEEKDAYS[date.tm_wday].substring(0, 3),
  "%A": date => WEEKDAYS[date.tm_wday],
  "%b": date => MONTHS[date.tm_mon].substring(0, 3),
  "%B": date => MONTHS[date.tm_mon],
  "%C": date => {
   var year = date.tm_year + 1900;
   return leadingNulls((year / 100) | 0, 2);
  },
  "%d": date => leadingNulls(date.tm_mday, 2),
  "%e": date => leadingSomething(date.tm_mday, 2, " "),
  "%g": date => getWeekBasedYear(date).toString().substring(2),
  "%G": getWeekBasedYear,
  "%H": date => leadingNulls(date.tm_hour, 2),
  "%I": date => {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": date => leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1), 3),
  "%m": date => leadingNulls(date.tm_mon + 1, 2),
  "%M": date => leadingNulls(date.tm_min, 2),
  "%n": () => "\n",
  "%p": date => {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   }
   return "PM";
  },
  "%S": date => leadingNulls(date.tm_sec, 2),
  "%t": () => "\t",
  "%u": date => date.tm_wday || 7,
  "%U": date => {
   var days = date.tm_yday + 7 - date.tm_wday;
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%V": date => {
   var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
   if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
    val++;
   }
   if (!val) {
    val = 52;
    var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
    if (dec31 == 4 || (dec31 == 5 && isLeapYear(date.tm_year % 400 - 1))) {
     val++;
    }
   } else if (val == 53) {
    var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
    if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
   }
   return leadingNulls(val, 2);
  },
  "%w": date => date.tm_wday,
  "%W": date => {
   var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%y": date => (date.tm_year + 1900).toString().substring(2),
  "%Y": date => date.tm_year + 1900,
  "%z": date => {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = (off / 60) * 100 + (off % 60);
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": date => date.tm_zone,
  "%%": () => "%"
 };
 pattern = pattern.replace(/%%/g, "\0\0");
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.includes(rule)) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 pattern = pattern.replace(/\0\0/g, "%");
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
};

var _strftime_l = (s, maxsize, format, tm, loc) => _strftime(s, maxsize, format, tm);

var stringToUTF8OnStack = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8(str, ret, size);
 return ret;
};

PThread.init();

embind_init_charCodes();

BindingError = Module["BindingError"] = class BindingError extends Error {
 constructor(message) {
  super(message);
  this.name = "BindingError";
 }
};

InternalError = Module["InternalError"] = class InternalError extends Error {
 constructor(message) {
  super(message);
  this.name = "InternalError";
 }
};

init_ClassHandle();

init_embind();

init_RegisteredPointer();

UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");

init_emval();

var proxiedFunctionTable = [ _proc_exit, exitOnMainThread, pthreadCreateProxied, _environ_get, _environ_sizes_get ];

function checkIncomingModuleAPI() {
 ignoredModuleProp("fetchSettings");
}

var wasmImports = {
 /** @export */ __assert_fail: ___assert_fail,
 /** @export */ __cxa_throw: ___cxa_throw,
 /** @export */ __emscripten_init_main_thread_js: ___emscripten_init_main_thread_js,
 /** @export */ __emscripten_thread_cleanup: ___emscripten_thread_cleanup,
 /** @export */ __handle_stack_overflow: ___handle_stack_overflow,
 /** @export */ __pthread_create_js: ___pthread_create_js,
 /** @export */ __pthread_kill_js: ___pthread_kill_js,
 /** @export */ _embind_register_bigint: __embind_register_bigint,
 /** @export */ _embind_register_bool: __embind_register_bool,
 /** @export */ _embind_register_class: __embind_register_class,
 /** @export */ _embind_register_class_constructor: __embind_register_class_constructor,
 /** @export */ _embind_register_class_function: __embind_register_class_function,
 /** @export */ _embind_register_emval: __embind_register_emval,
 /** @export */ _embind_register_float: __embind_register_float,
 /** @export */ _embind_register_function: __embind_register_function,
 /** @export */ _embind_register_integer: __embind_register_integer,
 /** @export */ _embind_register_memory_view: __embind_register_memory_view,
 /** @export */ _embind_register_std_string: __embind_register_std_string,
 /** @export */ _embind_register_std_wstring: __embind_register_std_wstring,
 /** @export */ _embind_register_void: __embind_register_void,
 /** @export */ _emscripten_get_now_is_monotonic: __emscripten_get_now_is_monotonic,
 /** @export */ _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
 /** @export */ _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
 /** @export */ _emscripten_sanitizer_get_option: __emscripten_sanitizer_get_option,
 /** @export */ _emscripten_sanitizer_use_colors: __emscripten_sanitizer_use_colors,
 /** @export */ _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
 /** @export */ _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
 /** @export */ _wasmfs_copy_preloaded_file_data: __wasmfs_copy_preloaded_file_data,
 /** @export */ _wasmfs_get_num_preloaded_dirs: __wasmfs_get_num_preloaded_dirs,
 /** @export */ _wasmfs_get_num_preloaded_files: __wasmfs_get_num_preloaded_files,
 /** @export */ _wasmfs_get_preloaded_child_path: __wasmfs_get_preloaded_child_path,
 /** @export */ _wasmfs_get_preloaded_file_mode: __wasmfs_get_preloaded_file_mode,
 /** @export */ _wasmfs_get_preloaded_file_size: __wasmfs_get_preloaded_file_size,
 /** @export */ _wasmfs_get_preloaded_parent_path: __wasmfs_get_preloaded_parent_path,
 /** @export */ _wasmfs_get_preloaded_path_name: __wasmfs_get_preloaded_path_name,
 /** @export */ _wasmfs_opfs_close_access: __wasmfs_opfs_close_access,
 /** @export */ _wasmfs_opfs_close_blob: __wasmfs_opfs_close_blob,
 /** @export */ _wasmfs_opfs_flush_access: __wasmfs_opfs_flush_access,
 /** @export */ _wasmfs_opfs_free_directory: __wasmfs_opfs_free_directory,
 /** @export */ _wasmfs_opfs_free_file: __wasmfs_opfs_free_file,
 /** @export */ _wasmfs_opfs_get_child: __wasmfs_opfs_get_child,
 /** @export */ _wasmfs_opfs_get_entries: __wasmfs_opfs_get_entries,
 /** @export */ _wasmfs_opfs_get_size_access: __wasmfs_opfs_get_size_access,
 /** @export */ _wasmfs_opfs_get_size_blob: __wasmfs_opfs_get_size_blob,
 /** @export */ _wasmfs_opfs_get_size_file: __wasmfs_opfs_get_size_file,
 /** @export */ _wasmfs_opfs_init_root_directory: __wasmfs_opfs_init_root_directory,
 /** @export */ _wasmfs_opfs_insert_directory: __wasmfs_opfs_insert_directory,
 /** @export */ _wasmfs_opfs_insert_file: __wasmfs_opfs_insert_file,
 /** @export */ _wasmfs_opfs_move_file: __wasmfs_opfs_move_file,
 /** @export */ _wasmfs_opfs_open_access: __wasmfs_opfs_open_access,
 /** @export */ _wasmfs_opfs_open_blob: __wasmfs_opfs_open_blob,
 /** @export */ _wasmfs_opfs_read_access: __wasmfs_opfs_read_access,
 /** @export */ _wasmfs_opfs_read_blob: __wasmfs_opfs_read_blob,
 /** @export */ _wasmfs_opfs_remove_child: __wasmfs_opfs_remove_child,
 /** @export */ _wasmfs_opfs_set_size_access: __wasmfs_opfs_set_size_access,
 /** @export */ _wasmfs_opfs_set_size_file: __wasmfs_opfs_set_size_file,
 /** @export */ _wasmfs_opfs_write_access: __wasmfs_opfs_write_access,
 /** @export */ _wasmfs_stdin_get_char: __wasmfs_stdin_get_char,
 /** @export */ _wasmfs_thread_utils_heartbeat: __wasmfs_thread_utils_heartbeat,
 /** @export */ abort: _abort,
 /** @export */ alignfault: alignfault,
 /** @export */ emscripten_asm_const_int: _emscripten_asm_const_int,
 /** @export */ emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
 /** @export */ emscripten_console_error: _emscripten_console_error,
 /** @export */ emscripten_console_log: _emscripten_console_log,
 /** @export */ emscripten_console_warn: _emscripten_console_warn,
 /** @export */ emscripten_date_now: _emscripten_date_now,
 /** @export */ emscripten_err: _emscripten_err,
 /** @export */ emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
 /** @export */ emscripten_get_heap_max: _emscripten_get_heap_max,
 /** @export */ emscripten_get_module_name: _emscripten_get_module_name,
 /** @export */ emscripten_get_now: _emscripten_get_now,
 /** @export */ emscripten_has_asyncify: _emscripten_has_asyncify,
 /** @export */ emscripten_num_logical_cores: _emscripten_num_logical_cores,
 /** @export */ emscripten_out: _emscripten_out,
 /** @export */ emscripten_pc_get_column: _emscripten_pc_get_column,
 /** @export */ emscripten_pc_get_file: _emscripten_pc_get_file,
 /** @export */ emscripten_pc_get_function: _emscripten_pc_get_function,
 /** @export */ emscripten_pc_get_line: _emscripten_pc_get_line,
 /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
 /** @export */ emscripten_return_address: _emscripten_return_address,
 /** @export */ emscripten_stack_unwind_buffer: _emscripten_stack_unwind_buffer,
 /** @export */ emscripten_unwind_to_js_event_loop: _emscripten_unwind_to_js_event_loop,
 /** @export */ environ_get: _environ_get,
 /** @export */ environ_sizes_get: _environ_sizes_get,
 /** @export */ exit: _exit,
 /** @export */ getentropy: _getentropy,
 /** @export */ memory: wasmMemory || Module["wasmMemory"],
 /** @export */ proc_exit: _proc_exit,
 /** @export */ segfault: segfault,
 /** @export */ strftime_l: _strftime_l
};

var wasmExports = createWasm();

var ___wasm_call_ctors = createExportWrapper("__wasm_call_ctors");

var _pthread_self = Module["_pthread_self"] = () => (_pthread_self = Module["_pthread_self"] = wasmExports["pthread_self"])();

var _free = createExportWrapper("free");

var _malloc = Module["_malloc"] = createExportWrapper("malloc");

var _fflush = createExportWrapper("fflush");

var _emscripten_builtin_free = createExportWrapper("emscripten_builtin_free");

var __emscripten_tls_init = Module["__emscripten_tls_init"] = createExportWrapper("_emscripten_tls_init");

var _emscripten_builtin_memalign = createExportWrapper("emscripten_builtin_memalign");

var ___getTypeName = createExportWrapper("__getTypeName");

var __embind_initialize_bindings = Module["__embind_initialize_bindings"] = createExportWrapper("_embind_initialize_bindings");

var __emscripten_thread_init = Module["__emscripten_thread_init"] = createExportWrapper("_emscripten_thread_init");

var __emscripten_thread_crashed = Module["__emscripten_thread_crashed"] = createExportWrapper("_emscripten_thread_crashed");

var _emscripten_main_thread_process_queued_calls = createExportWrapper("emscripten_main_thread_process_queued_calls");

var _emscripten_builtin_malloc = createExportWrapper("emscripten_builtin_malloc");

var _emscripten_main_runtime_thread_id = createExportWrapper("emscripten_main_runtime_thread_id");

var _emscripten_proxy_execute_queue = createExportWrapper("emscripten_proxy_execute_queue");

var _emscripten_stack_get_base = () => (_emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"])();

var _emscripten_stack_get_end = () => (_emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"])();

var _emscripten_proxy_finish = createExportWrapper("emscripten_proxy_finish");

var __emscripten_run_on_main_thread_js = createExportWrapper("_emscripten_run_on_main_thread_js");

var __emscripten_thread_free_data = createExportWrapper("_emscripten_thread_free_data");

var __emscripten_thread_exit = Module["__emscripten_thread_exit"] = createExportWrapper("_emscripten_thread_exit");

var _emscripten_get_sbrk_ptr = createExportWrapper("emscripten_get_sbrk_ptr");

var _sbrk = createExportWrapper("sbrk");

var __emscripten_check_mailbox = createExportWrapper("_emscripten_check_mailbox");

var _memalign = createExportWrapper("memalign");

var _emscripten_stack_init = () => (_emscripten_stack_init = wasmExports["emscripten_stack_init"])();

var _emscripten_stack_set_limits = (a0, a1) => (_emscripten_stack_set_limits = wasmExports["emscripten_stack_set_limits"])(a0, a1);

var _emscripten_stack_get_free = () => (_emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"])();

var stackSave = createExportWrapper("stackSave");

var stackRestore = createExportWrapper("stackRestore");

var stackAlloc = createExportWrapper("stackAlloc");

var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"])();

var ___cxa_increment_exception_refcount = createExportWrapper("__cxa_increment_exception_refcount");

var ___cxa_is_pointer_type = createExportWrapper("__cxa_is_pointer_type");

var __wasmfs_opfs_record_entry = createExportWrapper("_wasmfs_opfs_record_entry");

var _wasmfs_flush = createExportWrapper("wasmfs_flush");

var ___set_stack_limits = Module["___set_stack_limits"] = createExportWrapper("__set_stack_limits");

Module["wasmMemory"] = wasmMemory;

Module["keepRuntimeAlive"] = keepRuntimeAlive;

Module["UTF8ToString"] = UTF8ToString;

Module["stringToUTF8OnStack"] = stringToUTF8OnStack;

Module["ExitStatus"] = ExitStatus;

Module["PThread"] = PThread;

var missingLibrarySymbols = [ "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "growMemory", "ydayFromDate", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "getCallstack", "emscriptenLog", "runMainThreadEmAsm", "jstoi_q", "listenOnce", "autoResumeAudioContext", "getDynCaller", "dynCall", "runtimeKeepalivePop", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "getNativeTypeSize", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "getCFunc", "ccall", "cwrap", "uleb128Encode", "sigToWasmTypes", "generateFuncType", "convertJsFunctionToWasm", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "addFunction", "removeFunction", "reallyNegative", "strLen", "reSign", "formatString", "intArrayToString", "AsciiToString", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSizeCallingThread", "setCanvasElementSizeMainThread", "setCanvasElementSize", "getCanvasSizeCallingThread", "getCanvasSizeMainThread", "getCanvasElementSize", "stackTrace", "checkWasiClock", "flush_NO_FILESYSTEM", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "createDyncallWrapper", "safeSetTimeout", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "findMatchingCatch", "Browser_asyncPrepareDataCounter", "setMainLoop", "FS_createPreloadedFile", "FS_modeStringToFlags", "FS_getMode", "FS_createDataFile", "FS_mknod", "FS_create", "FS_writeFile", "FS_mkdir", "FS_mkdirTree", "FS_unlink", "wasmfsNodeConvertNodeCode", "wasmfsNodeFixStat", "wasmfsNodeLstat", "wasmfsNodeFstat", "heapObjectForWebGLType", "toTypedArrayIndex", "webgl_enable_ANGLE_instanced_arrays", "webgl_enable_OES_vertex_array_object", "webgl_enable_WEBGL_draw_buffers", "webgl_enable_WEBGL_multi_draw", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "__glGetActiveAttribOrUniform", "writeGLArray", "emscripten_webgl_destroy_context_before_on_calling_thread", "registerWebGlEventCallback", "runAndAbortIfError", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "writeStringToMemory", "writeAsciiToMemory", "setErrNo", "demangle", "getFunctionArgsName", "requireRegisteredType", "createJsInvokerSignature", "registerInheritedInstance", "unregisterInheritedInstance", "enumReadValueFromPointer", "validateThis", "getStringOrSymbol", "emval_get_global", "emval_returnValue", "emval_lookupTypes", "emval_addMethodCaller" ];

missingLibrarySymbols.forEach(missingLibrarySymbol);

var unexportedSymbols = [ "run", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "addRunDependency", "removeRunDependency", "FS_createFolder", "FS_createPath", "FS_createLazyFile", "FS_createLink", "FS_createDevice", "FS_readFile", "out", "err", "callMain", "abort", "wasmExports", "stackAlloc", "stackSave", "stackRestore", "getTempRet0", "setTempRet0", "WasmOffsetConverter", "writeStackCookie", "checkStackCookie", "intArrayFromBase64", "tryParseAsDataURI", "prettyPrint", "MAX_INT53", "MIN_INT53", "bigintToI53Checked", "ptrToString", "zeroMemory", "exitJS", "getHeapMax", "abortOnCannotGrowMemory", "ENV", "setStackLimits", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "isLeapYear", "arraySum", "addDays", "ERRNO_CODES", "ERRNO_MESSAGES", "DNS", "Protocols", "Sockets", "initRandomFill", "randomFill", "timers", "warnOnce", "UNWIND_CACHE", "convertPCtoSourceLocation", "withBuiltinMalloc", "readEmAsmArgsArray", "readEmAsmArgs", "runEmAsmFunction", "jstoi_s", "getExecutableName", "handleException", "runtimeKeepalivePush", "callUserCallback", "maybeExit", "HandleAllocator", "wasmTable", "noExitRuntime", "freeTableIndexes", "functionsInTableMap", "unSign", "setValue", "getValue", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "stringToUTF8Array", "stringToUTF8", "lengthBytesUTF8", "intArrayFromString", "stringToAscii", "UTF16Decoder", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "stringToNewUTF8", "writeArrayToMemory", "JSEvents", "specialHTMLTargets", "findCanvasEventTarget", "currentFullscreenStrategy", "restoreOldWindowedStyle", "jsStackTrace", "getEnvStrings", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "Browser", "getPreloadedImageData__data", "wget", "preloadPlugins", "FS_stdin_getChar_buffer", "FS_stdin_getChar", "MEMFS", "wasmFSPreloadedFiles", "wasmFSPreloadedDirs", "wasmFSPreloadingFlushed", "wasmFSDevices", "wasmFSDeviceStreams", "FS", "wasmFS$JSMemoryFiles", "wasmFS$backends", "wasmfsNodeIsWindows", "wasmfsOPFSDirectoryHandles", "wasmfsOPFSFileHandles", "wasmfsOPFSAccessHandles", "wasmfsOPFSBlobs", "wasmfsOPFSProxyFinish", "wasmfsOPFSGetOrCreateFile", "wasmfsOPFSGetOrCreateDir", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "GL", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "SDL", "SDL_gfx", "allocateUTF8", "allocateUTF8OnStack", "terminateWorker", "killThread", "cleanupThread", "registerTLSInit", "cancelThread", "spawnThread", "exitOnMainThread", "proxyToMainThread", "proxiedJSCallArgs", "invokeEntryPoint", "checkMailbox", "OPFS", "InternalError", "BindingError", "throwInternalError", "throwBindingError", "registeredTypes", "awaitingDependencies", "typeDependencies", "tupleRegistrations", "structRegistrations", "sharedRegisterType", "whenDependentTypesAreResolved", "embind_charCodes", "embind_init_charCodes", "readLatin1String", "getTypeName", "getFunctionName", "heap32VectorToArray", "usesDestructorStack", "createJsInvoker", "UnboundTypeError", "PureVirtualError", "GenericWireTypeSize", "EmValType", "init_embind", "throwUnboundTypeError", "ensureOverloadTable", "exposePublicSymbol", "replacePublicSymbol", "extendError", "createNamedFunction", "embindRepr", "registeredInstances", "getBasestPointer", "getInheritedInstance", "getInheritedInstanceCount", "getLiveInheritedInstances", "registeredPointers", "registerType", "integerReadValueFromPointer", "floatReadValueFromPointer", "readPointer", "runDestructors", "newFunc", "craftInvokerFunction", "embind__requireFunction", "genericPointerToWireType", "constNoSmartPtrRawPointerToWireType", "nonConstNoSmartPtrRawPointerToWireType", "init_RegisteredPointer", "RegisteredPointer", "RegisteredPointer_fromWireType", "runDestructor", "releaseClassHandle", "finalizationRegistry", "detachFinalizer_deps", "detachFinalizer", "attachFinalizer", "makeClassHandle", "init_ClassHandle", "ClassHandle", "throwInstanceAlreadyDeleted", "deletionQueue", "flushPendingDeletes", "delayFunction", "setDelayFunction", "RegisteredClass", "shallowCopyInternalPointer", "downcastPointer", "upcastPointer", "char_0", "char_9", "makeLegalFunctionName", "emval_freelist", "emval_handles", "emval_symbols", "init_emval", "count_emval_handles", "Emval", "emval_methodCallers", "reflectConstruct" ];

unexportedSymbols.forEach(unexportedRuntimeSymbol);

var calledRun;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function stackCheckInit() {
 assert(!ENVIRONMENT_IS_PTHREAD);
 _emscripten_stack_init();
 writeStackCookie();
}

function run() {
 if (runDependencies > 0) {
  dbg("run() called, but dependencies remain, so not running");
  return;
 }
 if (!ENVIRONMENT_IS_PTHREAD) stackCheckInit();
 if (ENVIRONMENT_IS_PTHREAD) {
  readyPromiseResolve(Module);
  initRuntime();
  startWorker(Module);
  return;
 }
 preRun();
 if (runDependencies > 0) {
  dbg("run() called, but dependencies remain, so not running");
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  readyPromiseResolve(Module);
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
 checkStackCookie();
}

function checkUnflushedContent() {
 var oldOut = out;
 var oldErr = err;
 var has = false;
 out = err = x => {
  has = true;
 };
 try {
  _wasmfs_flush();
 } catch (e) {}
 out = oldOut;
 err = oldErr;
 if (has) {
  warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
  warnOnce("(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)");
 }
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

run();


  return moduleArg.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = loadVosklet;
else if (typeof define === 'function' && define['amd'])
  define([], () => loadVosklet);