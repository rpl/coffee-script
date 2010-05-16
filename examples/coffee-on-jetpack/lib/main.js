var coffee_loader = require('coffee-loader').loader;
var globals = this;

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

  cft = coffee_loader.require("test");
  console.log(cft.test);

  /*
  var file = packaging.getURLForData("/test.coffee");
  var content = require('file').read(require('url').toFilename(file));
  console.log(require('coffee-script').compile(content));*/
  //require('coffee-script');
}
