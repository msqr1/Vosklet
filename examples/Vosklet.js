
var loadVosklet = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  
  return (
function(moduleArg = {}) {
  var moduleRtn;



  return moduleRtn;
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = loadVosklet;
else if (typeof define === 'function' && define['amd'])
  define([], () => loadVosklet);
var isPthread = globalThis.self?.name === 'em-pthread';
// When running as a pthread, construct a new instance on startup
isPthread && loadVosklet();