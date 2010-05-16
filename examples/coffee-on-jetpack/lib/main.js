var coffeescript = require('coffee-script');
var ios = Cc['@mozilla.org/network/io-service;1']
  .getService(Ci.nsIIOService);
var globals = this;

function coffee_CompositeResolveModule(base, path, ext) {
  for (var i = 0; i < this.fses.length; i++) {
    var fs = this.fses[i];
    var absPath = fs.resolveModule(base, path, ext);
    if (absPath) {
      this._pathMap[absPath] = fs;
      return absPath;
    }
  }
  return null;
}

function coffee_resolveModule(base, path, ext) {
  if(ext)
    path = path + "." + ext;
  else
    path = path + ".js";

  var baseURI;
  if (!base || path.charAt(0) != '.')
    baseURI = this._rootURI;
  else
    baseURI = ios.newURI(base, null, null);
  var newURI = ios.newURI(path, null, baseURI);
  if (newURI.spec.indexOf(this._rootURIDir) == 0) {
    var channel = ios.newChannelFromURI(newURI);
    try {
      channel.open().close();
    } catch (e if e.result == Cr.NS_ERROR_FILE_NOT_FOUND) {
      return null;
    }
    return newURI.spec;
  }
  return null;
}


function CoffeeFileSystem(root) {
  var fses = [create_fs(path)
              for each (path in packaging.options.rootPaths)];

  function create_fs(path) {
    var lfs = new (require('securable-module').LocalFileSystem)(path);
    lfs.resolveModule = coffee_resolveModule;
    return lfs;
  }

  this._fs = new (require('securable-module').CompositeFileSystem)(fses);

  this._fs.resolveModule = coffee_CompositeResolveModule;
}

CoffeeFileSystem.prototype = {
  resolveModule: function resolveModule(base, path) {
    var resolved = this._fs.resolveModule(base, path, "coffee");

    if(resolved)
      return resolved;

    return this._fs.resolveModule(base, path);
  },
  getFile: function getFile(path) {
    var content = this._fs.getFile(path);

    if(/\.coffee$/.test(path)) {
      console.log(content.contents);
      return coffeescript.compile(content.contents);
    }
    return content;
  }
}

exports.main = function () {
/*  for (var i in require('coffee-script')) {
    console.log(i);
  }

  console.log("NEW GLOBALS");
  for(var i in globals) {
    console.log(i);
  } 

  console.log("TESTS");

  console.log(require('coffee-script').compile.toString());
*/

  var loader_coffee = new (require('cuddlefish').Loader)({
    fs: new CoffeeFileSystem()
  });
  cft = loader_coffee.require("test");
  console.log(cft.test);

  /*
  var file = packaging.getURLForData("/test.coffee");
  var content = require('file').read(require('url').toFilename(file));
  console.log(require('coffee-script').compile(content));*/
  //require('coffee-script');
}
