'use strict'
var CODENAME = 'gulp-fonts2css'
var gutil = require('gulp-util')
var through = require('through2')
var path = require('path')
var fs = require('fs')
var Vinyl = require('vinyl')
var template = [
  '@font-face {\n',
  '  font-family: "{{fontName}}";\n',
  '  font-style: {{fontStyle}};\n',
  '  font-weight: {{fontWeight}};\n',
  '  src: url("data:application/x-font-{{fontType}};base64,{{base64}}") format("{{fontType}}");\n',
  '}\n'
].join('')
var defaults = {
  filename: 'fonts.css'
}
function getFileInfo (file) {
  var filename = path.basename(file.relative)
  var extension = path.extname(filename).slice(1, path.extname(filename).length)
  var font = filename.slice(0, filename.length - (extension.length + 1))
  return {
    fontType: extension,
    fontName: font.split('-')[0],
    fontWeight: font.split('-')[1],
    fontStyle: font.split('-')[2] ? font.split('-')[2] : 'normal',
    base64: file.contents.toString('base64')
  }
}
module.exports = function (options) {
  var settings = Object.assign( {}, defaults, options );
  var files = []
  var outputFile = null
  return through.obj(function(file, enc, callback){
    outputFile = outputFile || file
    files.push(file);
    callback();
  }, function(callback) {
    var vinyl = new Vinyl()
    var buffer = ''
    files.forEach(function (file) {
      var fileInfo = getFileInfo(file)
      buffer += template
        .replace(/{{fontName}}/g, fileInfo.fontName)
        .replace(/{{fontWeight}}/g, fileInfo.fontWeight)
        .replace(/{{fontType}}/g, fileInfo.fontType)
        .replace(/{{fontStyle}}/g, fileInfo.fontStyle.toLowerCase())
        .replace(/{{base64}}/g, fileInfo.base64)
    })
    vinyl.path = path.resolve(vinyl.base, settings.filename)
    vinyl.contents = new Buffer(buffer)
    this.push(vinyl)
    gutil.log(CODENAME, ': finished ( created ' + vinyl.path.replace(process.cwd(),'') + ')')
    callback()
  })
};