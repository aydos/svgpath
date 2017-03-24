// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==

// SVGPath
// Fahri Aydos, aydos.com
// 2016-06-18
// https://aydos.com/svgedit

/** @constructor */
(SVGPath = function() {
'use strict'

var dec = -1
var segs = []

/** @constructor */
var Segment = function() {		// All value are absolute
	this.t = ""					// relatives are calculate via px and py
	this.x = undefined			// this is good for optimize, analyse, rotate, etc
	this.y = undefined			// bad for round, so round logic updated
	this.px = undefined
	this.py = undefined
	this.x1 = undefined
	this.y1 = undefined
	this.x2 = undefined
	this.y2 = undefined
	this.r1 = undefined
	this.r2 = undefined
	this.ar = undefined
	this.af = undefined
	this.sf = undefined
	this.info = ""				// Analyse result
}

// format the segment for export
// check absolute-relative, and round decimals
function formatsegment(s) {
	var seg = new Segment()
	seg.t = s.t
	seg.x = s.t.charCodeAt(0)<96 ? rounddec(s.x) : rounddec(s.x - s.px)
	seg.y = s.t.charCodeAt(0)<96 ? rounddec(s.y) : rounddec(s.y - s.py)
	seg.px = rounddec(s.px)
	seg.py = rounddec(s.py)
	seg.x1 = s.x1==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.x1) : rounddec(s.x1 - s.px)
	seg.y1 = s.y1==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.y1) : rounddec(s.y1 - s.py)
	seg.x2 = s.x2==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.x2) : rounddec(s.x2 - s.px)
	seg.y2 = s.y2==undefined ? undefined : s.t.charCodeAt(0)<96 ? rounddec(s.y2) : rounddec(s.y2 - s.py)
	seg.r1 = s.r1==undefined ? undefined : rounddec(s.r1)
	seg.r2 = s.r1==undefined ? undefined : rounddec(s.r2)
	seg.ar = s.ar==undefined ? undefined : rounddec(s.ar)
	seg.af = s.af
	seg.sf = s.sf
	seg.info = s.info
	if (s.t == "M") {
		seg.info += "m " + rounddec(s.x - s.px) + " " + rounddec(s.y - s.py)
	}
	if (s.t == "m") {
		seg.info += "M " + rounddec(s.x) + " " + rounddec(s.y)
	}
	return seg
}

// import path from string
this.import = function(str) {
	str = str.replace(/\s/g, " ")						// white spaces
	str = str.trim()									// spaces at begin and end
	str = str.replace(/,/g, " ")						// commas
	str = str.replace(/([A-Za-z])([A-Za-z])/g, "$1 $2")	// two chars
	str = str.replace(/([A-Za-z])(\d)/g, "$1 $2")		// char + decimal
	str = str.replace(/([A-Za-z])(\.)/g, "$1 .")		// char + dot
	str = str.replace(/([A-Za-z])(-)/g, "$1 -")			// char + negative number
	str = str.replace(/(\d)([A-Za-z])/g, "$1 $2")		// decimal + char
	str = str.replace(/(\d)(-)/g, "$1 -")				// decimal + negative number
	var reg = /((?:-?[\d]*)\.\d+)((?:\.\d+)+)/g			// decimal + dot + decimal + dot + decimal
	while (reg.test(str)) {
		str = str.replace(reg, "$1 $2")
	}
	while (/  /.test(str)) {
		str = str.replace(/  /g, " ")					// clear double spaces
	}
	var list = str.split(" ")
	var pret = ""
	var prex = 0
	var prey = 0
	var begx = 0
	var begy = 0
	var j = 0
	var i = 0
	segs = []

	while (i<list.length) {
		var seg = new Segment()

		if (list[i].charCodeAt(0)>64) {
			seg.t = list[i++]
		} else {
			if (pret == "")
				break
			seg.t = pret == "M" ? "L" : pret == "m" ? "l" : pret
		}
		pret = seg.t

		switch (seg.t) {
		case "Z":
		case "z":
			seg.x = begx
			seg.y = begy
			break
		case "M":
		case "L":
		case "H":
		case "V":
		case "T":
			seg.x = seg.t=="V" ? prex : Number(list[i++])
			seg.y = seg.t=="H" ? prey : Number(list[i++])
			begx = seg.t=="M" ? seg.x : begx
			begy = seg.t=="M" ? seg.y : begy
			break
		case "m":
		case "l":
		case "h":
		case "v":
		case "t":
			seg.x = seg.t=="v" ? prex : prex + Number(list[i++])
			seg.y = seg.t=="h" ? prey : prey + Number(list[i++])
			begx = seg.t=="m" ? seg.x : begx
			begy = seg.t=="m" ? seg.y : begy
			break
		case "A":
		case "a":
			seg.r1 = Number(list[i++])
			seg.r2 = Number(list[i++])
			seg.ar = Number(list[i++])
			seg.af = Number(list[i++])
			seg.sf = Number(list[i++])
			seg.x = seg.t=="A" ? Number(list[i++]) : prex + Number(list[i++])
			seg.y = seg.t=="A" ? Number(list[i++]) : prey + Number(list[i++])
			break
		case "C":
		case "Q":
		case "S":
			seg.x1 = seg.t=="S" ? undefined : Number(list[i++])
			seg.y1 = seg.t=="S" ? undefined : Number(list[i++])
			seg.x2 = seg.t=="Q" ? undefined : Number(list[i++])
			seg.y2 = seg.t=="Q" ? undefined : Number(list[i++])
			seg.x = Number(list[i++])
			seg.y = Number(list[i++])
			break
		case "c":
		case "q":
		case "s":
			seg.x1 = seg.t=="s" ? undefined : prex + Number(list[i++])
			seg.y1 = seg.t=="s" ? undefined : prey + Number(list[i++])
			seg.x2 = seg.t=="q" ? undefined : prex + Number(list[i++])
			seg.y2 = seg.t=="q" ? undefined : prey + Number(list[i++])
			seg.x = prex + Number(list[i++])
			seg.y = prey + Number(list[i++])
			break
		default:
			i++
		}
		seg.px = prex
		seg.py = prey
		prex = seg.x
		prey = seg.y
		segs[j++] = seg
	}
}

// export path for final usage in <svg>
this.export = function() {
	var str = ""
	var pre = ""
	for (var i=0; i<segs.length; i++) {
		var seg = formatsegment(segs[i])
		switch (seg.t) {
		case "Z":
		case "z":
			str += seg.t
			break
		case "M":
		case "m":
			str += seg.t + seg.x + " " + seg.y
			break
		case "L":
			str += (pre==seg.t || pre=="M") ? " " : "L"
			str += seg.x + " " + seg.y
			break
		case "l":
			str += (pre==seg.t || pre=="m") ? " " : "l"
			str += seg.x + " " + seg.y
			break
		case "H":
		case "h":
			str += pre==seg.t ? " " : seg.t
			str += seg.x
			break
		case "V":
		case "v":
			str += pre==seg.t ? " " : seg.t
			str += seg.y
			break
		case "A":
		case "a":
			str += pre==seg.t ? " " : seg.t
			str += seg.r1 + " " + seg.r2 + " " + seg.ar + " " + seg.af + " " + seg.sf + " " + seg.x + " " + seg.y
			break
		case "C":
		case "c":
			str += pre==seg.t ? " " : seg.t
			str += seg.x1 + " " + seg.y1 + " " + seg.x2 + " " + seg.y2 + " " + seg.x + " " + seg.y
			break
		case "Q":
		case "q":
			str += pre==seg.t ? " " : seg.t
			str += seg.x1 + " " + seg.y1 + " " + seg.x + " " + seg.y
			break
		case "S":
		case "s":
			str += pre==seg.t ? " " : seg.t
			str += seg.x2 + " " + seg.y2 + " " + seg.x + " " + seg.y
			break
		case "T":
		case "t":
			str += pre==seg.t ? " " : seg.t
			str += seg.x + " " + seg.y
			break
		}
		pre = seg.t
	}
	str = str.replace(/ -/g, "-")
	str = str.replace(/-0\./g, "-.")
	str = str.replace(/ 0\./g, " .")
	str = str.replace(/([A-Za-z])0\./g, "$1.")
	str = str.replace(/(\.\d+) \./g, "$1.")
	return str
}

// export the segments as array
this.exportlist = function() {
	var list = []
	for (var i=0; i<segs.length; i++) {
		list[i] = formatsegment(segs[i])
	}
	return list
}

// make some analysis to minify
this.analyse = function(dist) {
	dist = Number(dist)
	if (isNaN(dist))
		dist = 0
	if (dist < 0)
		dist = 0

	for (var i=0; i<segs.length; i++) {
		segs[i].info = ""
	}

	// convert L to H or V
	for (var i=0; i<segs.length; i++) {
		if ((segs[i].x==segs[i].px) && (segs[i].t.toUpperCase()=="L")) {
			segs[i].t = segs[i].t == "L" ? "V" : "v"
		} else
		if ((segs[i].y==segs[i].py) && (segs[i].t.toUpperCase()=="L")) {
			segs[i].t = segs[i].t == "L" ? "H" : "h"
		}
	}

	var a = -1
	for (var i=0; i<segs.length-1; i++) {
		var dx = segs[i].x - segs[i].px
		var dy = segs[i].y - segs[i].py
		// two consecutive M
		if ((segs[i].t.toUpperCase()=="M") && (segs[i+1].t.toUpperCase()=="M")) {
			segs[i].info = "X"
			segs[i+1].px = i==0 ? 0 : segs[i-1].x
			segs[i+1].py = i==0 ? 0 : segs[i-1].y
		}
		// two consecutive Z
		if ((segs[i].t.toUpperCase()=="Z") && (segs[i+1].t.toUpperCase()=="Z")) {
			segs[i].info = "X"
		}
		// on the same line
		if (segs[i].t.toUpperCase()=="L" || segs[i].t.toUpperCase()=="H" || segs[i].t.toUpperCase()=="V") {
			var b = atan3(dx, dy)
			if (b == a) {
				segs[i-1].info = "X"
			}
			a = b
		} else {
			a = -1
		}
	}

	// first segment must be M
	if (segs[0].t.toUpperCase()!="M") {
		segs[0].t = segs[0].t.charCodeAt(0)<96 ? "M" : "m"
	}

	// last segment cant be M
	if (segs[segs.length-1].t.toUpperCase()=="M") {
		segs[segs.length-1].info = "X"
	}

	// remove certainly removables
	var i = segs.length
	while (i--) {
		if (segs[i].info == "X")
			segs.splice(i, 1)
	}

	if (dist==0)
		return

	// too close segments
	for (var i=0; i<segs.length-1; i++) {
		if (segs[i].t.toUpperCase()=="Z")
			continue
		var dx = segs[i].x - segs[i+1].x
		var dy = segs[i].y - segs[i+1].y
		var d = Math.sqrt(dx*dx + dy*dy)
		if (d <= dist) {
			segs[i].info = "D " + d + " "
		}
	}
}

function atan3(x, y) {
	var result = Math.atan2(y, x)
	if (result < 0) {
		result += 2 * Math.PI
	}
	return result
}

// make all segments absolute
this.absolute = function() {
	for (var i=0; i<segs.length; i++) {
		segs[i].t = segs[i].t.toUpperCase()
	}
}

// make all segments relative
this.relative = function() {
	for (var i=0; i<segs.length; i++) {
		segs[i].t = segs[i].t.toLowerCase()
	}
}

// set the global dec variable, to rounding decimals
this.round = function(d) {
	d = Number(d)
	if (isNaN(d))
		d = 0
	if (d<0)
		d = -1
	dec = Math.floor(d)
}

function rounddec(num) {
	if (dec<0)
		return num
	if (num % 1 === 0) {
		return num
	} else if (dec==0) {
		return Math.round(num)
	} else {
		var pow = Math.pow(10, dec)
		return Math.round(num * pow) / pow
	}
}

// move path with given dx, dy
this.move = function(dx, dy) {
	for (var i=0; i<segs.length; i++) {
		segs[i].x += dx
		segs[i].y += dy
		segs[i].px += dx
		segs[i].py += dy
		segs[i].x1 = segs[i].x1==undefined ? undefined : segs[i].x1 + dx
		segs[i].y1 = segs[i].y1==undefined ? undefined : segs[i].y1 + dy
		segs[i].x2 = segs[i].x2==undefined ? undefined : segs[i].x2 + dx
		segs[i].y2 = segs[i].y2==undefined ? undefined : segs[i].y2 + dy
	}
	segs[0].px = 0
	segs[0].py = 0
}

// flip horizontally with flip(undefined, center)
// flip vertically, with flip(center, undefined)
// flip wrt a point (px, py)
this.flip = function(x, y) {
	for (var i=0; i<segs.length; i++) {
		if (x!=undefined) {
			segs[i].x = x + (x - segs[i].x)
			segs[i].px = x + (x - segs[i].px)
			segs[i].x1 = segs[i].x1==undefined ? undefined : x + (x - segs[i].x1)
			segs[i].x2 = segs[i].x2==undefined ? undefined : x + (x - segs[i].x2)
			segs[i].sf = segs[i].sf==undefined ? undefined : (segs[i].sf+1)%2
		}
		if (y!=undefined) {
			segs[i].y = y + (y - segs[i].y)
			segs[i].py = y + (y - segs[i].py)
			segs[i].y1 = segs[i].y1==undefined ? undefined : y + (y - segs[i].y1)
			segs[i].y2 = segs[i].y2==undefined ? undefined : y + (y - segs[i].y2)
			segs[i].sf = segs[i].sf==undefined ? undefined : (segs[i].sf+1)%2
		}
	}
	segs[0].px = 0
	segs[0].py = 0
}

// move paths center to the given coordinates
this.center = function(x, y) {
	var minx = segs[0].x
	var miny = segs[0].y
	var maxx = segs[0].x
	var maxy = segs[0].y
	for (var i=1; i<segs.length; i++) {
		minx = segs[i].x<minx ? segs[i].x : minx
		miny = segs[i].y<miny ? segs[i].y : miny
		maxx = segs[i].x>maxx ? segs[i].x : maxx
		maxy = segs[i].y>maxy ? segs[i].y : maxy
	}
	var dx = x - minx - (maxx-minx)/2
	var dy = y - miny - (maxy-miny)/2
	this.move(dx, dy)
}

// scale path with a given ratio
this.scale = function (ratio) {
	ratio = Number(ratio)
	if (isNaN(ratio))
		return
	if (ratio <= 0)
		return
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]
		seg.x *= ratio
		seg.y *= ratio
		seg.px *= ratio
		seg.py *= ratio
		seg.x1 = seg.x1==undefined ? undefined : ratio * seg.x1
		seg.y1 = seg.y1==undefined ? undefined : ratio * seg.y1
		seg.x2 = seg.x2==undefined ? undefined : ratio * seg.x2
		seg.y2 = seg.y2==undefined ? undefined : ratio * seg.y2
		seg.r1 = seg.r1==undefined ? undefined : ratio * seg.r1
		seg.r2 = seg.r2==undefined ? undefined : ratio * seg.r2
	}
}

// rotate the path with given center and rotation degree
this.rotate = function(x, y, d) {
	d *= Math.PI/180
	var sin = Math.sin(d)
	var cos = Math.cos(d)
	for (var i=0; i<segs.length; i++) {
		var rp = rotatepoint(segs[i].x, segs[i].y, x, y, sin, cos)
		segs[i].x = rp[0]
		segs[i].y = rp[1]
		var rp = rotatepoint(segs[i].px, segs[i].py, x, y, sin, cos)
		segs[i].px = rp[0]
		segs[i].py = rp[1]
		if (segs[i].x1!=undefined) {
			var rp = rotatepoint(segs[i].x1, segs[i].y1, x, y, sin, cos)
			segs[i].x1 = rp[0]
			segs[i].y1 = rp[1]
		}
		if (segs[i].x2!=undefined) {
			var rp = rotatepoint(segs[i].x2, segs[i].y2, x, y, sin, cos)
			segs[i].x2 = rp[0]
			segs[i].y2 = rp[1]
		}
		if (segs[i].t=="H" || segs[i].t=="V") {
			segs[i].t = "L"
		}
		if (segs[i].t=="h" || segs[i].t=="v") {
			segs[i].t = "l"
		}
	}
	segs[0].px = 0
	segs[0].py = 0
}

function rotatepoint(px, py, ox, oy, sin, cos) {
	var x = cos * (px-ox) - sin * (py-oy) + ox
	var y = sin * (px-ox) + cos * (py-oy) + oy
	return [x, y]
}

}) // end of SVGPath
