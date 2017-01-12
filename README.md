# gulp-fonts2css
## Intro

Transforms font files into CSS (base64). 
```css
Input: 

fonts/MyFont-400-italic.woff

Output: 

@font-face {
  font-family: "MyFont";
  font-weight: 400;
  font-style: italic;
  src: url("data:application/font-woff;base64,<<<base64 will be here>>>") format("woff");
}
```

## Example usage
```js
var gulp = require('gulp'),
    fonts2css = require('gulp-fonts2css');

gulp.task('fonts2css', function () {
  return gulp.src('./fonts/*.woff')
    .pipe(fonts2css({
      filename: 'myfont' // optional, default = 'fonts', result will be myfont-400.css
    }))
    .pipe(gulp.dest('dist'));
});
```

