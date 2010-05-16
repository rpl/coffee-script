var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
var coffeescript = require('coffee-script');
var securablemodule = require('securable-module');
var csh = require('cuddlefish');

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

function coffee_ResolveModule(base, path, ext) {
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
    var lfs = new (securablemodule.LocalFileSystem)(path);
    lfs.resolveModule = coffee_ResolveModule;
    return lfs;
  }

  this._fs = new (securablemodule.CompositeFileSystem)(fses);

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

exports.loader = new csh.Loader({fs: new CoffeeFileSystem()});