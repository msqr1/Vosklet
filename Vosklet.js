var loadVosklet = (() => { var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined; return (function(moduleArg = {}) { var moduleRtn;function m(){p.buffer!=q.buffer&&r();return q}function t(){p.buffer!=q.buffer&&r();return aa}function ba(){p.buffer!=q.buffer&&r();return ca}function da(){p.buffer!=q.buffer&&r();return ha}function u(){p.buffer!=q.buffer&&r();return ia}function z(){p.buffer!=q.buffer&&r();return ja}function ka(){p.buffer!=q.buffer&&r();return la}var A=moduleArg,ma,na,oa=new Promise((a,b)=>{ma=a;na=b}),pa="object"==typeof window,qa="function"==typeof importScripts,ra="object"==typeof process&&"object"==typeof process.Oa&&"string"==typeof process.Oa.node,sa=A.$ww;let B=[],ta=["status","partialResult","result"],ua=URL.createObjectURL(new Blob(["(",(async()=>{let a=new TextDecoder,b=new TextEncoder,c=await navigator.storage.getDirectory();onmessage=async d=>{d=d.data;var e=d.Na.split("/"),f=c;for(var g of e)f=await f.getDirectoryHandle(g,{create:!0});e=await f.getFileHandle("id",{create:!0});g=await f.getFileHandle("model.tgz",{create:!0});f=await e.createSyncAccessHandle();e=await g.createSyncAccessHandle();g=new ArrayBuffer(f.getSize());f.read(g);let h;if(a.decode(g)==d.id)h=new ArrayBuffer(e.getSize()),e.read(h),d=await (new Response((new Response(h)).body.pipeThrough(new DecompressionStream("gzip")))).arrayBuffer();else{g=await fetch(d.url);if(!g.ok)throw"Unable to download model";g=g.body.tee();h=await (new Response(g[0].pipeThrough(new CompressionStream("gzip")))).arrayBuffer();e.write(h,{at:0});e.truncate(h.byteLength);d=b.encode(d.id);f.write(d,{at:0});f.truncate(d.length);d=await (new Response(g[1])).arrayBuffer()}f.close();e.close();self.postMessage(d,[d])}}).toString(),")()"],{type:"text/javascript"})),va=new Worker(ua),wa=URL.createObjectURL(new Blob(["(",(()=>{registerProcessor("VoskletTransferer",class extends AudioWorkletProcessor{constructor(a){super();this.count=0;this.sa=a.processorOptions.sa;this.buffer=new Float32Array(128*this.sa)}process(a){if(!a[0][0])return!0;this.buffer.set(a[0][0],128*this.count++);this.count>=this.sa&&(this.count=0,this.port.postMessage(this.buffer,[this.buffer.buffer]),this.buffer=new Float32Array(128*this.sa));return!0}})}).toString(),")()"],{type:"text/javascript"}));async function xa(a,b,c,d){let e=new ya,f=new Promise((g,h)=>{e.addEventListener("status",k=>{k.detail?h(k.detail):(d&&(e.findWord=l=>e.ha.findWord(l)),g(e))},{once:!0})});va.addEventListener("message",g=>{g=g.data;let h=C(g.byteLength);t().set(new Uint8Array(g),h);e.ha=new A.CommonModel(B.length-1,d,"/"+b,c,h,g.byteLength)},{once:!0});va.postMessage({url:a,Na:b,id:c});return f}class ya extends EventTarget{constructor(){super();B.push(this)}delete(){this.ha.delete()}}async function za(a,b,c,d,e){let f=new Aa,g=new Promise((h,k)=>{f.addEventListener("status",l=>{l.detail?k(l.detail):h(f)},{once:!0})});switch(c){case 1:f.ha=new A.Recognizer(B.length-1,b,a);break;case 2:f.ha=new A.Recognizer(B.length-1,b,a,e);break;default:f.ha=new A.Recognizer(B.length-1,b,a,d,0)}return g}class Aa extends EventTarget{constructor(){super();this.acceptWaveform=a=>{let b=C(4*a.length);ka().set(a,b/4);this.ha.acceptWaveform(b,a.length)};B.push(this);return new Proxy(this,{get(a,b){if(void 0!=a[b]||void 0!=a.ha[b]){var c=a[b];if(c)return c.bind?c.bind(a):c;c=a.ha[b];return c.bind?c.bind(a.ha):c}}})}async delete(a=!1){let b=new Promise(c=>this.addEventListener("status",()=>{this.ha.delete();c()},{once:!0}));this.ha.safeDelete(a);return b}}A={cleanUp:async()=>{for(let a of B)await a.delete();URL.revokeObjectURL(wa);URL.revokeObjectURL(ua);va.terminate()},createTransferer:async(a,b)=>{await a.audioWorklet.addModule(wa);return new AudioWorkletNode(a,"VoskletTransferer",{channelCountMode:"explicit",numberOfInputs:1,numberOfOutputs:0,channelCount:1,processorOptions:{sa:b/128}})},createModel:(a,b,c)=>xa(a,b,c,!0),createSpkModel:(a,b,c)=>xa(a,b,c,!1),createRecognizer:(a,b)=>za(a.ha,b,1),createRecognizerWithGrm:(a,b,c)=>za(a.ha,b,3,c,null),createRecognizerWithSpkModel:(a,b,c)=>za(a.ha,b,2,null,c.ha)};var Ba=Object.assign({},A),F="",Ca,Da;if(pa||qa)qa?F=self.location.href:"undefined"!=typeof document&&document.currentScript&&(F=document.currentScript.src),_scriptName&&(F=_scriptName),F.startsWith("blob:")?F="":F=F.substr(0,F.replace(/[?#].*/,"").lastIndexOf("/")+1),qa&&(Da=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),Ca=a=>fetch(a,{credentials:"same-origin"}).then(b=>b.ok?b.arrayBuffer():Promise.reject(Error(b.status+" : "+b.url)));var Ea=console.log.bind(console),G=console.error.bind(console);Object.assign(A,Ba);Ba=null;var p,Fa,Ga=!1,Ha,q,aa,ca,ha,ia,ja,la,Ia,Ja,Ka;function r(){var a=p.buffer;A.HEAP8=q=new Int8Array(a);A.HEAP16=ca=new Int16Array(a);A.HEAPU8=aa=new Uint8Array(a);A.HEAPU16=ha=new Uint16Array(a);A.HEAP32=ia=new Int32Array(a);A.HEAPU32=ja=new Uint32Array(a);A.HEAPF32=la=new Float32Array(a);A.HEAPF64=Ka=new Float64Array(a);A.HEAP64=Ia=new BigInt64Array(a);A.HEAPU64=Ja=new BigUint64Array(a)}if(A.wasmMemory)p=A.wasmMemory;else if(p=new WebAssembly.Memory({initial:5040,maximum:32768,shared:!0}),!(p.buffer instanceof SharedArrayBuffer))throw G("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),ra&&G("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"),Error("bad memory");r();var La=[],Ma=[],Na=[];function Oa(){if(sa){let a=A;Pa(a.sb,a.sz);removeEventListener("message",Qa);Ra=Ra.forEach(Sa);addEventListener("message",Sa)}else for(;0<Ma.length;)Ma.shift()(A)}var H=0,Ta=null,I=null;function Ua(a){a="Aborted("+a+")";G(a);Ga=!0;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");na(a);throw a;}var Va=a=>a.startsWith("data:application/octet-stream;base64,"),Wa;function Xa(a){return Ca(a).then(b=>new Uint8Array(b),()=>{if(Da)var b=Da(a);else throw"both async and sync fetching of the wasm failed";return b})}function Ya(a,b,c){return Xa(a).then(d=>WebAssembly.instantiate(d,b)).then(c,d=>{G(`failed to asynchronously prepare wasm: ${d}`);Ua(d)})}function Za(a,b){var c=Wa;return"function"!=typeof WebAssembly.instantiateStreaming||Va(c)||"function"!=typeof fetch?Ya(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(e){G(`wasm streaming compile failed: ${e}`);G("falling back to ArrayBuffer instantiation");return Ya(c,a,b)}))}function bb(a){this.name="ExitStatus";this.message=`Program terminated with exit(${a})`;this.status=a}var Ra=[],cb=[],db,eb=a=>{var b=cb[a];b||(a>=cb.length&&(cb.length=a+1),cb[a]=b=db.get(a));return b},Sa=a=>{a=a.data;let b=a._wsc;b&&eb(b)(...a.x)},Qa=a=>{Ra.push(a)},fb=new TextDecoder,J=(a,b)=>{if(!a)return"";b=a+b;for(var c=a;!(c>=b)&&t()[c];)++c;return fb.decode(t().slice(a,c))};class gb{constructor(a){this.fa=a-24}}var hb=0,ib=0,jb=a=>{if(null===a)return"null";var b=typeof a;return"object"===b||"array"===b||"function"===b?a.toString():""+a},kb,K=a=>{for(var b="";t()[a];)b+=kb[t()[a++]];return b},L={},M={},lb={},N,mb=a=>{throw new N(a);},O,Q=(a,b,c)=>{function d(h){h=c(h);if(h.length!==a.length)throw new O("Mismatched type converter count");for(var k=0;k<a.length;++k)P(a[k],h[k])}a.forEach(h=>lb[h]=b);var e=Array(b.length),f=[],g=0;b.forEach((h,k)=>{M.hasOwnProperty(h)?e[k]=M[h]:(f.push(h),L.hasOwnProperty(h)||(L[h]=[]),L[h].push(()=>{e[k]=M[h];++g;g===f.length&&d(e)}))});0===f.length&&d(e)};function nb(a,b,c={}){var d=b.name;if(!a)throw new N(`type "${d}" must have a positive integer typeid pointer`);if(M.hasOwnProperty(a)){if(c.Ha)return;throw new N(`Cannot register type '${d}' twice`);}M[a]=b;delete lb[a];L.hasOwnProperty(a)&&(b=L[a],delete L[a],b.forEach(e=>e()))}function P(a,b,c={}){return nb(a,b,c)}var ob=(a,b,c)=>{switch(b){case 1:return c?d=>m()[d]:d=>t()[d];case 2:return c?d=>ba()[d>>1]:d=>da()[d>>1];case 4:return c?d=>u()[d>>2]:d=>z()[d>>2];case 8:return c?d=>Ia[d>>3]:d=>Ja[d>>3];default:throw new TypeError(`invalid integer width (${b}): ${a}`);}},pb=a=>{throw new N(a.da.ga.ea.name+" instance already deleted");},qb=!1,rb=()=>{},sb=(a,b,c)=>{if(b===c)return a;if(void 0===c.ka)return null;a=sb(a,b,c.ka);return null===a?null:c.Da(a)},tb={},R=[],ub=()=>{for(;R.length;){var a=R.pop();a.da.qa=!1;a["delete"]()}},S,T={},vb=(a,b)=>{if(void 0===b)throw new N("ptr should not be undefined");for(;a.ka;)b=a.ua(b),a=a.ka;return T[b]},wb=(a,b)=>{if(!b.ga||!b.fa)throw new O("makeClassHandle requires ptr and ptrType");if(!!b.ma!==!!b.ia)throw new O("Both smartPtrType and smartPtr must be specified");b.count={value:1};return U(Object.create(a,{da:{value:b,writable:!0}}))},U=a=>{if("undefined"===typeof FinalizationRegistry)return U=b=>b,a;qb=new FinalizationRegistry(b=>{b=b.da;--b.count.value;0===b.count.value&&(b.ia?b.ma.oa(b.ia):b.ga.ea.oa(b.fa))});U=b=>{var c=b.da;c.ia&&qb.register(b,{da:c},b);return b};rb=b=>{qb.unregister(b)};return U(a)};function xb(){}var yb=(a,b)=>Object.defineProperty(b,"name",{value:a}),zb=(a,b,c)=>{if(void 0===a[b].ja){var d=a[b];a[b]=function(...e){if(!a[b].ja.hasOwnProperty(e.length))throw new N(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${a[b].ja})!`);return a[b].ja[e.length].apply(this,e)};a[b].ja=[];a[b].ja[d.va]=d}},Ab=(a,b,c)=>{if(A.hasOwnProperty(a)){if(void 0===c||void 0!==A[a].ja&&void 0!==A[a].ja[c])throw new N(`Cannot register public name '${a}' twice`);zb(A,a,a);if(A.hasOwnProperty(c))throw new N(`Cannot register multiple overloads of a function with the same number of arguments (${c})!`);A[a].ja[c]=b}else A[a]=b,void 0!==c&&(A[a].Ra=c)},Bb=a=>{if(void 0===a)return"_unknown";a=a.replace(/[^a-zA-Z0-9_]/g,"$");var b=a.charCodeAt(0);return 48<=b&&57>=b?`_${a}`:a};function Cb(a,b,c,d,e,f,g,h){this.name=a;this.constructor=b;this.ra=c;this.oa=d;this.ka=e;this.Fa=f;this.ua=g;this.Da=h;this.Ja=[]}var Db=(a,b,c)=>{for(;b!==c;){if(!b.ua)throw new N(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);a=b.ua(a);b=b.ka}return a};function Eb(a,b){if(null===b){if(this.ya)throw new N(`null is not a valid ${this.name}`);return 0}if(!b.da)throw new N(`Cannot pass "${jb(b)}" as a ${this.name}`);if(!b.da.fa)throw new N(`Cannot pass deleted object as a pointer of type ${this.name}`);return Db(b.da.fa,b.da.ga.ea,this.ea)}function Fb(a,b){if(null===b){if(this.ya)throw new N(`null is not a valid ${this.name}`);if(this.xa){var c=this.Ka();null!==a&&a.push(this.oa,c);return c}return 0}if(!b||!b.da)throw new N(`Cannot pass "${jb(b)}" as a ${this.name}`);if(!b.da.fa)throw new N(`Cannot pass deleted object as a pointer of type ${this.name}`);if(!this.wa&&b.da.ga.wa)throw new N(`Cannot convert argument of type ${b.da.ma?b.da.ma.name:b.da.ga.name} to parameter type ${this.name}`);c=Db(b.da.fa,b.da.ga.ea,this.ea);if(this.xa){if(void 0===b.da.ia)throw new N("Passing raw pointer to smart pointer is illegal");switch(this.Ma){case 0:if(b.da.ma===this)c=b.da.ia;else throw new N(`Cannot convert argument of type ${b.da.ma?b.da.ma.name:b.da.ga.name} to parameter type ${this.name}`);break;case 1:c=b.da.ia;break;case 2:if(b.da.ma===this)c=b.da.ia;else{var d=b.clone();c=this.La(c,Gb(()=>d["delete"]()));null!==a&&a.push(this.oa,c)}break;default:throw new N("Unsupporting sharing policy");}}return c}function Hb(a,b){if(null===b){if(this.ya)throw new N(`null is not a valid ${this.name}`);return 0}if(!b.da)throw new N(`Cannot pass "${jb(b)}" as a ${this.name}`);if(!b.da.fa)throw new N(`Cannot pass deleted object as a pointer of type ${this.name}`);if(b.da.ga.wa)throw new N(`Cannot convert argument of type ${b.da.ga.name} to parameter type ${this.name}`);return Db(b.da.fa,b.da.ga.ea,this.ea)}function Ib(a){return this.fromWireType(z()[a>>2])}function Jb(a,b,c,d,e,f,g,h,k,l,n){this.name=a;this.ea=b;this.ya=c;this.wa=d;this.xa=e;this.Ia=f;this.Ma=g;this.Ba=h;this.Ka=k;this.La=l;this.oa=n;e||void 0!==b.ka?this.toWireType=Fb:(this.toWireType=d?Eb:Hb,this.la=null)}var Kb=(a,b,c)=>{if(!A.hasOwnProperty(a))throw new O("Replacing nonexistent public symbol");void 0!==A[a].ja&&void 0!==c?A[a].ja[c]=b:(A[a]=b,A[a].va=c)},V=(a,b)=>{a=K(a);var c=eb(b);if("function"!=typeof c)throw new N(`unknown function pointer with signature ${a}: ${b}`);return c},Lb,Nb=a=>{a=Mb(a);var b=K(a);W(a);return b},Ob=(a,b)=>{function c(f){e[f]||M[f]||(lb[f]?lb[f].forEach(c):(d.push(f),e[f]=!0))}var d=[],e={};b.forEach(c);throw new Lb(`${a}: `+d.map(Nb).join([", "]));},Pb=(a,b)=>{for(var c=[],d=0;d<a;d++)c.push(z()[b+4*d>>2]);return c},Qb=a=>{for(;a.length;){var b=a.pop();a.pop()(b)}};function Rb(a){for(var b=1;b<a.length;++b)if(null!==a[b]&&void 0===a[b].la)return!0;return!1}function Sb(a){var b=Function;if(!(b instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);var c=yb(b.name||"unknownFunctionName",function(){});c.prototype=b.prototype;c=new c;a=b.apply(c,a);return a instanceof Object?a:c}function Ub(a,b,c,d,e,f){var g=b.length;if(2>g)throw new N("argTypes array size mismatch! Must at least get return value and 'this' types!");var h=null!==b[1]&&null!==c,k=Rb(b);c="void"!==b[0].name;d=[a,mb,d,e,Qb,b[0],b[1]];for(e=0;e<g-2;++e)d.push(b[e+2]);if(!k)for(e=h?1:2;e<b.length;++e)null!==b[e].la&&d.push(b[e].la);k=Rb(b);e=b.length-2;var l=[],n=["fn"];h&&n.push("thisWired");for(g=0;g<e;++g)l.push(`arg${g}`),n.push(`arg${g}Wired`);l=l.join(",");n=n.join(",");l=`\n return function (${l}) {\n if (arguments.length !== ${e}) {\n throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${e}');\n }`;k&&(l+="var destructors = [];\n");var x=k?"destructors":"null",v="humanName throwBindingError invoker fn runDestructors retType classParam".split(" ");h&&(l+=`var thisWired = classParam['toWireType'](${x}, this);\n`);for(g=0;g<e;++g)l+=`var arg${g}Wired = argType${g}['toWireType'](${x}, arg${g});\n`,v.push(`argType${g}`);l+=(c||f?"var rv = ":"")+`invoker(${n});\n`;if(k)l+="runDestructors(destructors);\n";else for(g=h?1:2;g<b.length;++g)f=1===g?"thisWired":"arg"+(g-2)+"Wired",null!==b[g].la&&(l+=`${f}_dtor(${f});\n`,v.push(`${f}_dtor`));c&&(l+="var ret = retType['fromWireType'](rv);\nreturn ret;\n");let [y,w]=[v,l+"}\n"];y.push(w);b=Sb(y)(...d);return yb(a,b)}var Vb=a=>{a=a.trim();const b=a.indexOf("(");return-1!==b?a.substr(0,b):a},Wb=[],X=[],Gb=a=>{switch(a){case void 0:return 2;case null:return 4;case !0:return 6;case !1:return 8;default:const b=Wb.pop()||X.length;X[b]=a;X[b+1]=1;return b}},Xb={name:"emscripten::val",fromWireType:a=>{if(!a)throw new N("Cannot use deleted val. handle = "+a);var b=X[a];9<a&&0===--X[a+1]&&(X[a]=void 0,Wb.push(a));return b},toWireType:(a,b)=>Gb(b),na:8,readValueFromPointer:Ib,la:null},Yb=(a,b,c)=>{switch(b){case 1:return c?function(d){return this.fromWireType(m()[d])}:function(d){return this.fromWireType(t()[d])};case 2:return c?function(d){return this.fromWireType(ba()[d>>1])}:function(d){return this.fromWireType(da()[d>>1])};case 4:return c?function(d){return this.fromWireType(u()[d>>2])}:function(d){return this.fromWireType(z()[d>>2])};default:throw new TypeError(`invalid integer width (${b}): ${a}`);}},Zb=a=>{var b=M[a];if(void 0===b)throw a=`${"enum"} has unknown type ${Nb(a)}`,new N(a);return b},$b=(a,b)=>{switch(b){case 4:return function(c){return this.fromWireType(ka()[c>>2])};case 8:return function(c){var d=this.fromWireType;p.buffer!=q.buffer&&r();return d.call(this,Ka[c>>3])};default:throw new TypeError(`invalid float width (${b}): ${a}`);}},Y=(a,b,c,d)=>{if(!(0<d))return 0;var e=c;d=c+d-1;for(var f=0;f<a.length;++f){var g=a.charCodeAt(f);if(55296<=g&&57343>=g){var h=a.charCodeAt(++f);g=65536+((g&1023)<<10)|h&1023}if(127>=g){if(c>=d)break;b[c++]=g}else{if(2047>=g){if(c+1>=d)break;b[c++]=192|g>>6}else{if(65535>=g){if(c+2>=d)break;b[c++]=224|g>>12}else{if(c+3>=d)break;b[c++]=240|g>>18;b[c++]=128|g>>12&63}b[c++]=128|g>>6&63}b[c++]=128|g&63}}b[c]=0;return c-e},ac=(a,b)=>{var c=17;Y(a,t(),b,c)},bc=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b},cc=new TextDecoder("utf-16le"),dc=(a,b)=>{var c=a>>1;for(b=c+b/2;!(c>=b)&&da()[c];)++c;c<<=1;return cc.decode(t().slice(a,c))},ec=(a,b,c)=>{c??=2147483647;if(2>c)return 0;c-=2;var d=b;c=c<2*a.length?c/2:a.length;for(var e=0;e<c;++e){var f=a.charCodeAt(e);ba()[b>>1]=f;b+=2}ba()[b>>1]=0;return b-d},fc=a=>2*a.length,gc=(a,b)=>{for(var c=0,d="";!(c>=b/4);){var e=u()[a+4*c>>2];if(0==e)break;++c;65536<=e?(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023)):d+=String.fromCharCode(e)}return d},hc=(a,b,c)=>{c??=2147483647;if(4>c)return 0;var d=b;c=d+c-4;for(var e=0;e<a.length;++e){var f=a.charCodeAt(e);if(55296<=f&&57343>=f){var g=a.charCodeAt(++e);f=65536+((f&1023)<<10)|g&1023}u()[b>>2]=f;b+=4;if(b+4>c)break}u()[b>>2]=0;return b-d},ic=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&++c;b+=4}return b},jc={},kc=1,lc=URL.createObjectURL(new Blob(["onmessage=function(d){onmessage=null;d=d.data;d[`instantiateWasm`]=(i,r)=>{var n=new WebAssembly.Instance(d[`wasm`],i);return r(n,d[`wasm`]);};importScripts(d.js);loadVosklet(d);d.wasm=d.mem=d.js=0;}"],{type:"application/javascript"})),mc={},nc=a=>{if(!(a instanceof bb||"unwind"==a))throw a;},oc=0,pc=a=>{Ha=a;0<oc||(Ga=!0);throw new bb(a);},qc=a=>{if(!Ga)try{if(a(),!(0<oc))try{Ha=a=Ha,pc(a)}catch(b){nc(b)}}catch(b){nc(b)}},rc;rc=()=>performance.now();for(var sc=[],tc=[],uc=[],vc={},xc=()=>{if(!wc){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:"./this.program"},b;for(b in vc)void 0===vc[b]?delete a[b]:a[b]=vc[b];var c=[];for(b in a)c.push(`${b}=${a[b]}`);wc=c}return wc},wc,yc=()=>{if("object"==typeof crypto&&"function"==typeof crypto.getRandomValues)return a=>(a.set(crypto.getRandomValues(new Uint8Array(a.byteLength))),a);Ua("initRandomDevice")},zc=a=>(zc=yc())(a),Ac=Array(256),Bc=0;256>Bc;++Bc)Ac[Bc]=String.fromCharCode(Bc);kb=Ac;N=A.BindingError=class extends Error{constructor(a){super(a);this.name="BindingError"}};O=A.InternalError=class extends Error{constructor(a){super(a);this.name="InternalError"}};Object.assign(xb.prototype,{isAliasOf:function(a){if(!(this instanceof xb&&a instanceof xb))return!1;var b=this.da.ga.ea,c=this.da.fa;a.da=a.da;var d=a.da.ga.ea;for(a=a.da.fa;b.ka;)c=b.ua(c),b=b.ka;for(;d.ka;)a=d.ua(a),d=d.ka;return b===d&&c===a},clone:function(){this.da.fa||pb(this);if(this.da.ta)return this.da.count.value+=1,this;var a=U,b=Object,c=b.create,d=Object.getPrototypeOf(this),e=this.da;a=a(c.call(b,d,{da:{value:{count:e.count,qa:e.qa,ta:e.ta,fa:e.fa,ga:e.ga,ia:e.ia,ma:e.ma}}}));a.da.count.value+=1;a.da.qa=!1;return a},["delete"](){this.da.fa||pb(this);if(this.da.qa&&!this.da.ta)throw new N("Object already scheduled for deletion");rb(this);var a=this.da;--a.count.value;0===a.count.value&&(a.ia?a.ma.oa(a.ia):a.ga.ea.oa(a.fa));this.da.ta||(this.da.ia=void 0,this.da.fa=void 0)},isDeleted:function(){return!this.da.fa},deleteLater:function(){this.da.fa||pb(this);if(this.da.qa&&!this.da.ta)throw new N("Object already scheduled for deletion");R.push(this);1===R.length&&S&&S(ub);this.da.qa=!0;return this}});A.getInheritedInstanceCount=()=>Object.keys(T).length;A.getLiveInheritedInstances=()=>{var a=[],b;for(b in T)T.hasOwnProperty(b)&&a.push(T[b]);return a};A.flushPendingDeletes=ub;A.setDelayFunction=a=>{S=a;R.length&&S&&S(ub)};Object.assign(Jb.prototype,{Ga(a){this.Ba&&(a=this.Ba(a));return a},Aa(a){this.oa?.(a)},na:8,readValueFromPointer:Ib,fromWireType:function(a){function b(){return this.xa?wb(this.ea.ra,{ga:this.Ia,fa:c,ma:this,ia:a}):wb(this.ea.ra,{ga:this,fa:a})}var c=this.Ga(a);if(!c)return this.Aa(a),null;var d=vb(this.ea,c);if(void 0!==d){if(0===d.da.count.value)return d.da.fa=c,d.da.ia=a,d.clone();d=d.clone();this.Aa(a);return d}d=this.ea.Fa(c);d=tb[d];if(!d)return b.call(this);d=this.wa?d.Ca:d.pointerType;var e=sb(c,this.ea,d.ea);return null===e?b.call(this):this.xa?wb(d.ea.ra,{ga:d,fa:e,ma:this,ia:a}):wb(d.ea.ra,{ga:d,fa:e})}});Lb=A.UnboundTypeError=((a,b)=>{var c=yb(b,function(d){this.name=b;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(a.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:`${this.name}: ${this.message}`};return c})(Error,"UnboundTypeError");X.push(0,1,void 0,1,null,1,!0,1,!1,1);A.count_emval_handles=()=>X.length/2-5-Wb.length;sa&&(jc[0]=this,addEventListener("message",Qa));var Dc={c:(a,b,c,d)=>{Ua(`Assertion failed: ${J(a)}, at: `+[b?J(b):"unknown filename",c,d?J(d):"unknown function"])},t:(a,b)=>eb(a)(b),d:(a,b,c)=>{var d=new gb(a);z()[d.fa+16>>2]=0;z()[d.fa+4>>2]=b;z()[d.fa+8>>2]=c;hb=a;ib++;throw hb;},P:()=>{Ua("")},q:(a,b,c)=>{b=K(b);P(a,{name:b,fromWireType:d=>d,toWireType:function(d,e){if("bigint"!=typeof e&&"number"!=typeof e)throw new TypeError(`Cannot convert "${jb(e)}" to ${this.name}`);"number"==typeof e&&(e=BigInt(e));return e},na:8,readValueFromPointer:ob(b,c,-1==b.indexOf("u")),la:null})},S:(a,b,c,d)=>{b=K(b);P(a,{name:b,fromWireType:function(e){return!!e},toWireType:function(e,f){return f?c:d},na:8,readValueFromPointer:function(e){return this.fromWireType(t()[e])},la:null})},o:(a,b,c,d,e,f,g,h,k,l,n,x,v)=>{n=K(n);f=V(e,f);h&&=V(g,h);l&&=V(k,l);v=V(x,v);var y=Bb(n);Ab(y,function(){Ob(`Cannot construct ${n} due to unbound types`,[d])});Q([a,b,c],d?[d]:[],w=>{w=w[0];if(d){var D=w.ea;var ea=D.ra}else ea=xb.prototype;w=yb(n,function(...$a){if(Object.getPrototypeOf(this)!==ab)throw new N("Use 'new' to construct "+n);if(void 0===E.pa)throw new N(n+" has no accessible constructor");var Tb=E.pa[$a.length];if(void 0===Tb)throw new N(`Tried to invoke ctor of ${n} with invalid number of parameters (${$a.length}) - expected (${Object.keys(E.pa).toString()}) parameters instead!`);return Tb.apply(this,$a)});var ab=Object.create(ea,{constructor:{value:w}});w.prototype=ab;var E=new Cb(n,w,ab,v,D,f,h,l);if(E.ka){var fa;(fa=E.ka).za??(fa.za=[]);E.ka.za.push(E)}D=new Jb(n,E,!0,!1,!1);fa=new Jb(n+"*",E,!1,!1,!1);ea=new Jb(n+" const*",E,!1,!0,!1);tb[a]={pointerType:fa,Ca:ea};Kb(y,w);return[D,fa,ea]})},j:(a,b,c,d,e,f)=>{var g=Pb(b,c);e=V(d,e);Q([],[a],h=>{h=h[0];var k=`constructor ${h.name}`;void 0===h.ea.pa&&(h.ea.pa=[]);if(void 0!==h.ea.pa[b-1])throw new N(`Cannot register multiple constructors with identical number of parameters (${b-1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);h.ea.pa[b-1]=()=>{Ob(`Cannot construct ${h.name} due to unbound types`,g)};Q([],g,l=>{l.splice(1,0,null);h.ea.pa[b-1]=Ub(k,l,null,e,f);return[]});return[]})},g:(a,b,c,d,e,f,g,h,k)=>{var l=Pb(c,d);b=K(b);b=Vb(b);f=V(e,f);Q([],[a],n=>{function x(){Ob(`Cannot call ${v} due to unbound types`,l)}n=n[0];var v=`${n.name}.${b}`;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);h&&n.ea.Ja.push(b);var y=n.ea.ra,w=y[b];void 0===w||void 0===w.ja&&w.className!==n.name&&w.va===c-2?(x.va=c-2,x.className=n.name,y[b]=x):(zb(y,b,v),y[b].ja[c-2]=x);Q([],l,D=>{D=Ub(v,D,n,f,g,k);void 0===y[b].ja?(D.va=c-2,y[b]=D):y[b].ja[c-2]=D;return[]});return[]})},R:a=>P(a,Xb),s:(a,b,c,d)=>{function e(){}b=K(b);e.values={};P(a,{name:b,constructor:e,fromWireType:function(f){return this.constructor.values[f]},toWireType:(f,g)=>g.value,na:8,readValueFromPointer:Yb(b,c,d),la:null});Ab(b,e)},k:(a,b,c)=>{var d=Zb(a);b=K(b);a=d.constructor;d=Object.create(d.constructor.prototype,{value:{value:c},constructor:{value:yb(`${d.name}_${b}`,function(){})}});a.values[c]=d;a[b]=d},p:(a,b,c)=>{b=K(b);P(a,{name:b,fromWireType:d=>d,toWireType:(d,e)=>e,na:8,readValueFromPointer:$b(b,c),la:null})},C:(a,b,c,d,e,f,g)=>{var h=Pb(b,c);a=K(a);a=Vb(a);e=V(d,e);Ab(a,function(){Ob(`Cannot call ${a} due to unbound types`,h)},b-1);Q([],h,k=>{Kb(a,Ub(a,[k[0],null].concat(k.slice(1)),null,e,f,g),b-1);return[]})},i:(a,b,c,d,e)=>{b=K(b);-1===e&&(e=4294967295);e=h=>h;if(0===d){var f=32-8*c;e=h=>h<<f>>>f}var g=b.includes("unsigned")?function(h,k){return k>>>0}:function(h,k){return k};P(a,{name:b,fromWireType:e,toWireType:g,na:8,readValueFromPointer:ob(b,c,0!==d),la:null})},e:(a,b,c)=>{function d(f){var g=z()[f>>2];f=z()[f+4>>2];return new e(m().buffer,f,g)}var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][b];c=K(c);P(a,{name:c,fromWireType:d,na:8,readValueFromPointer:d},{Ha:!0})},r:(a,b)=>{b=K(b);var c="std::string"===b;P(a,{name:b,fromWireType:function(d){var e=z()[d>>2],f=d+4;if(c)for(var g=f,h=0;h<=e;++h){var k=f+h;if(h==e||0==t()[k]){g=J(g,k-g);if(void 0===l)var l=g;else l+=String.fromCharCode(0),l+=g;g=k+1}}else{l=Array(e);for(h=0;h<e;++h)l[h]=String.fromCharCode(t()[f+h]);l=l.join("")}W(d);return l},toWireType:function(d,e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));var f="string"==typeof e;if(!(f||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Int8Array))throw new N("Cannot pass non-string to std::string");var g=c&&f?bc(e):e.length;var h=C(4+g+1),k=h+4;z()[h>>2]=g;if(c&&f)g+=1,Y(e,t(),k,g);else if(f)for(f=0;f<g;++f){var l=e.charCodeAt(f);if(255<l)throw W(k),new N("String has UTF-16 code units that do not fit in 8 bits");t()[k+f]=l}else for(f=0;f<g;++f)t()[k+f]=e[f];null!==d&&d.push(W,h);return h},na:8,readValueFromPointer:Ib,la(d){W(d)}})},n:(a,b,c)=>{c=K(c);if(2===b){var d=dc;var e=ec;var f=fc;var g=h=>da()[h>>1]}else 4===b&&(d=gc,e=hc,f=ic,g=h=>z()[h>>2]);P(a,{name:c,fromWireType:h=>{for(var k=z()[h>>2],l,n=h+4,x=0;x<=k;++x){var v=h+4+x*b;if(x==k||0==g(v))n=d(n,v-n),void 0===l?l=n:(l+=String.fromCharCode(0),l+=n),n=v+b}W(h);return l},toWireType:(h,k)=>{if("string"!=typeof k)throw new N(`Cannot pass non-string to C++ string type ${c}`);var l=f(k),n=C(4+l+b);z()[n>>2]=l/b;e(k,n+4,l+b);null!==h&&h.push(W,n);return n},na:8,readValueFromPointer:Ib,la(h){W(h)}})},T:(a,b)=>{b=K(b);P(a,{Qa:!0,name:b,na:0,fromWireType:()=>{},toWireType:()=>{}})},I:(a,b)=>{let c=jc[kc]=new Worker(lc);c.postMessage({$ww:kc,wasm:Fa,js:A.mainScriptUrlOrBlob||_scriptName,wasmMemory:p,sb:a,sz:b});c.onmessage=Sa;return kc++},O:()=>1,v:()=>{oc=0},w:(a,b)=>{mc[a]&&(clearTimeout(mc[a].id),delete mc[a]);if(!b)return 0;var c=setTimeout(()=>{delete mc[a];qc(()=>Cc(a,rc()))},b);mc[a]={id:c,Ua:b};return 0},K:(a,b,c,d)=>{var e=(new Date).getFullYear(),f=(new Date(e,0,1)).getTimezoneOffset();e=(new Date(e,6,1)).getTimezoneOffset();var g=Math.max(f,e);z()[a>>2]=60*g;u()[b>>2]=Number(f!=e);b=h=>{var k=Math.abs(h);return`UTC${0<=h?"-":"+"}${String(Math.floor(k/60)).padStart(2,"0")}${String(k%60).padStart(2,"0")}`};a=b(f);b=b(e);e<f?(ac(a,c),ac(b,d)):(ac(a,d),ac(b,c))},E:(a,b)=>t().set(tc[a].Ea,b),B:()=>sc.length,D:()=>tc.length,z:(a,b)=>{a=sc[a].Pa;var c=bc(a)+1;Y(a,t(),b,c)},x:a=>tc[a].mode,F:a=>tc[a].Ea.length,A:(a,b)=>{a=sc[a].Sa;var c=bc(a)+1;Y(a,t(),b,c)},y:(a,b)=>{a=tc[a].Ta;var c=bc(a)+1;Y(a,t(),b,c)},H:()=>{a:{if(!uc.length){var a=null;"undefined"!=typeof window&&"function"==typeof window.prompt&&(a=window.prompt("Input: "),null!==a&&(a+="\n"));if(!a){var b=null;break a}b=Array(bc(a)+1);a=Y(a,b,0,b.length);b.length=a;uc=b}b=uc.shift()}return"number"===typeof b?b:-1},U:a=>{console.error(J(a))},W:a=>{console.log(J(a))},V:a=>{console.warn(J(a))},f:()=>Date.now(),l:a=>G(J(a)),m:rc,G:a=>Ea(J(a)),L:a=>{var b=t().length;a>>>=0;if(a<=b||2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);a:{d=(Math.min(2147483648,65536*Math.ceil(Math.max(a,d)/65536))-p.buffer.byteLength+65535)/65536;try{p.grow(d);r();var e=1;break a}catch(f){}e=void 0}if(e)return!0}return!1},h:(a,b,c,d,e)=>{jc[a].postMessage({_wsc:b,x:[c,d,e]})},M:(a,b)=>{var c=0;xc().forEach((d,e)=>{var f=b+c;e=z()[a+4*e>>2]=f;for(f=0;f<d.length;++f)m()[e++]=d.charCodeAt(f);m()[e]=0;c+=d.length+1});return 0},N:(a,b)=>{var c=xc();z()[a>>2]=c.length;var d=0;c.forEach(e=>d+=e.length+1);z()[b>>2]=d;return 0},b:a=>{Ha=a;pc(a)},J:(a,b)=>{zc(t().subarray(a,a+b));return 0},a:p,X:function(a,b,c){B[a].dispatchEvent(new CustomEvent(ta[b],{detail:0==c?null:J(c)}))},u:pc,Q:function(a,b){Object.values(jc).forEach(c=>{c.postMessage({_wsc:a,x:[b]})})}},Z=function(){function a(c,d){Z=c.exports;db=Z.$;Ma.unshift(Z.Y);Fa=d;H--;0==H&&(null!==Ta&&(clearInterval(Ta),Ta=null),I&&(c=I,I=null,c()));return Z}var b={a:Dc};H++;if(A.instantiateWasm)try{return A.instantiateWasm(b,a)}catch(c){G(`Module.instantiateWasm callback failed with error: ${c}`),na(c)}Wa||=Va("Vosklet.wasm")?"Vosklet.wasm":F+"Vosklet.wasm";Za(b,function(c){a(c.instance,c.module)}).catch(na);return{}}(),W=a=>(W=Z.Z)(a),C=a=>(C=Z._)(a),Mb=a=>(Mb=Z.aa)(a),Cc=(a,b)=>(Cc=Z.ba)(a,b),Pa=(a,b)=>(Pa=Z.ca)(a,b),Ec;I=function Fc(){Ec||Gc();Ec||(I=Fc)};function Gc(){if(!(0<H))if(sa)ma(A),Oa();else{for(;0<La.length;)La.shift()(A);if(!(0<H||Ec||(Ec=!0,A.calledRun=!0,Ga)))for(Oa(),ma(A);0<Na.length;)Na.shift()(A)}}Gc();moduleRtn=oa; return moduleRtn;});})();if (typeof exports === 'object' && typeof module === 'object') module.exports = loadVosklet;else if (typeof define === 'function' && define['amd']) define([], () => loadVosklet);