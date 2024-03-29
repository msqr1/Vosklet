let objs = [] 
let processorURL = URL.createObjectURL(new Blob(['(', (() => {
  registerProcessor("VoskletTransferer", class extends AudioWorkletProcessor {
    constructor(opts) {
      super()
      this.count = 0
      this.maxCount = opts.processorOptions.maxCount
      this.buffer = new Float32Array(this.maxCount * 128)
    }
    process(inputs) {
      this.buffer.set(inputs[0][0], this.count * 128)
      this.count++
      if(this.count >= this.maxCount) {
        this.count = 0
        this.port.postMessage(this.buffer, [this.buffer.buffer])
        this.buffer = new Float32Array(this.maxCount * 128)
      }
      return true
    }
  })
}).toString(), ')()'], { type : "text/javascript" }))
let pthreadURL = URL.createObjectURL(new Blob(['(', (() => {
  /**
   * @license
   * Copyright 2015 The Emscripten Authors
   * SPDX-License-Identifier: MIT
   */

  // Pthread Web Worker startup routine:
  // This is the entry point file that is loaded first by each Web Worker
  // that executes pthreads on the Emscripten application.

  'use strict';

  var Module = {};

  // Thread-local guard variable for one-time init of the JS state
  var initializedJS = false;

  function assert(condition, text) {
    if (!condition) abort('Assertion failed: ' + text);
  }

  function threadPrintErr(...args) {
    var text = args.join(' ');
    console.error(text);
  }
  function threadAlert(...args) {
    var text = args.join(' ');
    postMessage({cmd: 'alert', text, threadId: Module['_pthread_self']()});
  }
  // We don't need out() for now, but may need to add it if we want to use it
  // here. Or, if this code all moves into the main JS, that problem will go
  // away. (For now, adding it here increases code size for no benefit.)
  var out = () => { throw 'out() is not defined in worker.js.'; }
  var err = threadPrintErr;
  self.alert = threadAlert;
  var dbg = threadPrintErr;

  Module['instantiateWasm'] = (info, receiveInstance) => {
    // Instantiate from the module posted from the main thread.
    // We can just use sync instantiation in the worker.
    var module = Module['wasmModule'];
    // We don't need the module anymore; new threads will be spawned from the main thread.
    Module['wasmModule'] = null;
    var instance = new WebAssembly.Instance(module, info);
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193,
    // the above line no longer optimizes out down to the following line.
    // When the regression is fixed, we can remove this if/else.
    return receiveInstance(instance);
  }

  // Turn unhandled rejected promises into errors so that the main thread will be
  // notified about them.
  self.onunhandledrejection = (e) => {
    throw e.reason || e;
  };

  function handleMessage(e) {
    try {
      if (e.data.cmd === 'load') { // Preload command that is called once per worker to parse and load the Emscripten code.

      // Until we initialize the runtime, queue up any further incoming messages.
      let messageQueue = [];
      self.onmessage = (e) => messageQueue.push(e);

      // And add a callback for when the runtime is initialized.
      self.startWorker = (instance) => {
        Module = instance;
        // Notify the main thread that this thread has loaded.
        postMessage({ 'cmd': 'loaded' });
        // Process any messages that were queued before the thread was ready.
        for (let msg of messageQueue) {
          handleMessage(msg);
        }
        // Restore the real message handler.
        self.onmessage = handleMessage;
      };

        // Module and memory were sent from main thread
        Module['wasmModule'] = e.data.wasmModule;

        // Use `const` here to ensure that the variable is scoped only to
        // that iteration, allowing safe reference from a closure.
        for (const handler of e.data.handlers) {
          Module[handler] = (...args) => {
            postMessage({ cmd: 'callHandler', handler, args: args });
          }
        }

        Module['wasmMemory'] = e.data.wasmMemory;

        Module['buffer'] = Module['wasmMemory'].buffer;

        Module['workerID'] = e.data.workerID;

        Module['ENVIRONMENT_IS_PTHREAD'] = true;

        if (typeof e.data.urlOrBlob == 'string') {
          importScripts(e.data.urlOrBlob);
        } else {
          var objectUrl = URL.createObjectURL(e.data.urlOrBlob);
          importScripts(objectUrl);
          URL.revokeObjectURL(objectUrl);
        }
        loadVosklet(Module);
      } else if (e.data.cmd === 'run') {
        // Pass the thread address to wasm to store it for fast access.
        Module['__emscripten_thread_init'](e.data.pthread_ptr, /*is_main=*/0, /*is_runtime=*/0, /*can_block=*/1);

        // Await mailbox notifications with `Atomics.waitAsync` so we can start
        // using the fast `Atomics.notify` notification path.
        Module['__emscripten_thread_mailbox_await'](e.data.pthread_ptr);

        assert(e.data.pthread_ptr);
        // Also call inside JS module to set up the stack frame for this pthread in JS module scope
        Module['establishStackSpace']();
        Module['PThread'].receiveObjectTransfer(e.data);
        Module['PThread'].threadInitTLS();

        if (!initializedJS) {
          // Embind must initialize itself on all threads, as it generates support JS.
          // We only do this once per worker since they get reused
          Module['__embind_initialize_bindings']();
          initializedJS = true;
        }

        try {
          Module['invokeEntryPoint'](e.data.start_routine, e.data.arg);
        } catch(ex) {
          if (ex != 'unwind') {
            // The pthread "crashed".  Do not call `_emscripten_thread_exit` (which
            // would make this thread joinable).  Instead, re-throw the exception
            // and let the top level handler propagate it back to the main thread.
            throw ex;
          }
        }
      } else if (e.data.cmd === 'cancel') { // Main thread is asking for a pthread_cancel() on this thread.
        if (Module['_pthread_self']()) {
          Module['__emscripten_thread_exit'](-1);
        }
      } else if (e.data.target === 'setimmediate') {
        // no-op
      } else if (e.data.cmd === 'checkMailbox') {
        if (initializedJS) {
          Module['checkMailbox']();
        }
      } else if (e.data.cmd) {
        // The received message looks like something that should be handled by this message
        // handler, (since there is a e.data.cmd field present), but is not one of the
        // recognized commands:
        err(`worker.js received unknown command ${e.data.cmd}`);
        err(e.data);
      }
    } catch(ex) {
      err(`worker.js onmessage() captured an uncaught exception: ${ex}`);
      if (ex?.stack) err(ex.stack);
      Module['__emscripten_thread_crashed']?.();
      throw ex;
    }
  };

  self.onmessage = handleMessage;

}).toString(), ')()'], { type : "text/javascript" }))
Module.cleanUp = () => {
  objs.forEach(obj => obj.obj.delete())
  URL.revokeObjectURL(pthreadURL)
  URL.revokeObjectURL(processorURL)
}
Module.createTransferer = async (ctx, bufferSize) => {
  await ctx.audioWorklet.addModule(processorURL)
  return new AudioWorkletNode(ctx, "VoskletTransferer", { 
    channelCountMode : "explicit", 
    numberOfInputs : 1,
    numberOfOutputs : 1,
    channelCount : 1,
    processorOptions : { maxCount: bufferSize / 128 }
  })
}
Module.locateFile = (path, scriptDir) => {
  if(path === "Vosklet.worker.js") return pthreadURL
  return scriptDir + path
}
async function getFileHandle(path, create = false) {
  let components = path.split("/")
  let prevDir = await navigator.storage.getDirectory()
  for(let component of components.slice(0, -1)) {
    prevDir = await prevDir.getDirectoryHandle(component, { create : create })
  }
  return prevDir.getFileHandle(components[components.length - 1], { create : create })
}
class genericModel extends EventTarget {
  constructor() {
    super()
    objs.push(this)
  }
  static async create(url, storepath, id, normalMdl) {
    let mdl = new genericModel()
    let result = new Promise((resolve, reject) => {
      mdl.addEventListener("0", ev => {
        if(ev.detail === "0") return resolve(mdl)
        mdl.delete()
        reject(ev.detail)
      }, { once : true })
    })
    let tar
    mdl.obj = new Module.genericModel(objs.length - 1, normalMdl, "/" + storepath, id)
    try {
      let dataFile = await (await getFileHandle(storepath + "/model.tgz")).getFile()
      let idFile = await (await getFileHandle(storepath + "/id")).getFile()
      if(await idFile.text() !== id) throw ""
      tar = dataFile.stream()  
    }
    catch {
      try {
        let res = await fetch(url)
        if(!res.ok) {
          throw "Unable to download model"
        }
        let teedBody = res.body.tee()
        let newDataFile = await (await getFileHandle(storepath + "/model.tgz", true)).createWritable()
        await newDataFile.write(await new Response(teedBody[0]).arrayBuffer())
        await newDataFile.close()
        let newIDFile = await (await getFileHandle(storepath + "/id", true)).createWritable()
        await newIDFile.write(id)
        await newIDFile.close()
        tar = teedBody[1]
      }
      catch(e) {
        mdl.obj.delete()
        throw e
      }
    }
    tar = await new Response(tar.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()
    let tarStart = Module._malloc(tar.byteLength)
    Module.HEAPU8.set(new Uint8Array(tar), tarStart)
    mdl.obj.extractAndLoad(tarStart, tar.byteLength)
    return result
  }
  delete() {
    this.obj.delete()
  }
}
Module.createModel = async (url, storepath, id) => {
  return genericModel.create(url, storepath, id, true)
}
Module.createSpkModel = async (url, storepath, id) => {
  return genericModel.create(url, storepath, id, false)
}
class recognizer extends EventTarget {
  constructor() {
    super()
    objs.push(this)
    return new Proxy(this, {
      get(self, prop, receiver) {
        return self.obj && Object.keys(Object.getPrototypeOf(self.obj)).includes(prop) ? self.obj[prop].bind(self.obj) : self[prop] ? self[prop].bind ? self[prop].bind(self) : self[prop] : undefined
      }
    })
  }
  static async create(model, sampleRate, mode, grammar, spkModel) {
    let rec = new recognizer()
    let result = new Promise((resolve, reject) => {
      rec.addEventListener("0", ev => {
        if(ev.detail === "0") return resolve(rec)
        rec.delete()
        reject(ev.detail)
      }, { once : true })
    })
    switch(mode) {
      case 1:
        rec.obj = new Module.recognizer(objs.length - 1, sampleRate, model)
        break
      case 2:
        rec.obj = new Module.recognizer(objs.length -1, sampleRate, model, spkModel) 
        break
      default:
        rec.obj = new Module.recognizer(objs.length - 1, sampleRate, grammar, 0)  
    }
    return result
  } 
  acceptWaveform(audioData) {
    let start = Module._malloc(audioData.length * 4)
    Module.HEAPF32.set(audioData, start / 4)
    this.obj.pushData(start, audioData.length)
  }
}
Module.createRecognizer = (model, sampleRate) => {
  return recognizer.create(model.obj, sampleRate, 1)
}
Module.createRecognizerWithSpkModel = (model, sampleRate, spkModel) => {
  return recognizer.create(model.obj, sampleRate, 2, null, spkModel)
} 
Module.createRecognizerWithGrm = (model, sampleRate, grammar) => {
  return recognizer.create(model.obj, sampleRate, 3, grammar, null)
} 