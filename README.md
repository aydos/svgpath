# SVGPath

SVG path segments parser and optimiser used at [aydos.com/svgedit](https://aydos.com/svgedit)

## Functions

### import

Import SVG Path string. SVGPath works with only one "path".

### export

Export final SVG Path string.

### exportlist

Export final SVG Path as segments array. You can work with this array.

### analyse

Do some optimization on path. Remove consequtive Ms, remove points on the same line. Detect and mark (not delete) segment too close each other.

### absolute

Make all segments absolute.

### relative

Make all segmets relative.

### round

Round decimal points.

### move

Move the path with given dx, dy.

### flip

Flip the path with given point or given axis.

### center

Centralize the path to given point x, y.

### scale

Scale the path.

### rotate

Rotate the path wrt point x, y with angle d.