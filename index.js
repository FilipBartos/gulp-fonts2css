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
  '  src: url("data:{{fontMime}};base64,{{base64}}") format("{{fontFormat}}");\n',
  '}\n'
].join('')
var meta = {
  ttf: {
    mimetype: 'application/font-sfnt',
    format: 'truetype'
  },
  woff: {
    mimetype: 'application/font-woff',
    format: 'woff'
  },
  woff2: {
    mimetype: 'font/woff2',
    format: 'woff2'
  },
}
var defaults = {
  filename: 'fonts',
}
function getFileExtension (filename) {
  return path.extname(filename).slice(1, path.extname(filename).length)
}
function getFileInfo (file) {
  var filename = path.basename(file.relative)
  var extension = getFileExtension(filename)
  var font = filename.slice(0, filename.length - (extension.length + 1))
  var props = font.split('-')
  return {
    fontFormat: meta[extension]['format'],
    fontMime: meta[extension]['mimetype'],
    fontName: props[0],
    fontWeight: props[1] || 400,
    fontStyle: props[2] || 'normal',
    base64: file.contents.toString('base64')
  }
}
function getFontTypes (fonts) {
  var fontTypes = []
  fonts.forEach(function (font) {
    var filename = path.basename(font.relative)
    var extension = getFileExtension(filename)
    if(fontTypes.indexOf(extension) === -1) {
      fontTypes.push(extension)
    }
  })
  return fontTypes
}
module.exports = function (options) {
  var settings = Object.assign( {}, defaults, options )
  var fonts = []
  return through.obj(function(file, enc, callback){
    fonts.push(file)
    callback()
  }, function(callback) {
    var fontTypes = getFontTypes(fonts)
    fontTypes.forEach((function (fontType) {
      var vinyl = new Vinyl()
      var buffer = ''
      fonts.forEach(function (font) {
        var filename = path.basename(font.relative)
        if (fontType === getFileExtension(filename)) {
          var fontInfo = getFileInfo(font, settings)
          buffer += template
            .replace(/{{fontName}}/g, fontInfo.fontName)
            .replace(/{{fontMime}}/g, fontInfo.fontMime)
            .replace(/{{fontFormat}}/g, fontInfo.fontFormat)
            .replace(/{{fontWeight}}/g, fontInfo.fontWeight)
            .replace(/{{fontStyle}}/g, fontInfo.fontStyle.toLowerCase())
            .replace(/{{base64}}/g, fontInfo.base64)
        }
      })
      vinyl.path = path.resolve(vinyl.base, settings.filename+'-'+fontType+'.css')
      vinyl.contents = new Buffer(buffer)
      this.push(vinyl)
      gutil.log(CODENAME, ': finished ( created ' + vinyl.relative + ')')
    }).bind(this))
    callback()
  })
};
