
var loadVosklet = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(moduleArg = {}) {



  return moduleArg.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = loadVosklet;
else if (typeof define === 'function' && define['amd'])
  define([], () => loadVosklet);