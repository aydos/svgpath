// SVG Parser
// Fahri Aydos, aydos.com
// 2016-06-18

/** @this {Element} */
SVGParser = function() {
"use strict"
var self = this
var segs = []
var decs = 3
var ifcheckdecimals = true

var Segment = function() {
	this.t = ''
	this.x = undefined
	this.y = undefined
	this.x1 = undefined
	this.y1 = undefined
	this.x2 = undefined
	this.y2= undefined
	this.r1 = undefined
	this.r2 = undefined
	this.a = undefined
	this.af = undefined
	this.sf = undefined
}

this.parse = function(path) {
	path = path.replace(/,/g, " ")
	path = path.replace(/([A-Za-z])([A-Za-z])/g, "$1 $2")
	path = path.replace(/([A-Za-z])(\d)/g, "$1 $2")
	path = path.replace(/([A-Za-z])(\.)/g, "$1 .")
	path = path.replace(/([A-Za-z])(-)/g, "$1 -")
	path = path.replace(/(\d)([A-Za-z])/g, "$1 $2")
	path = path.replace(/(\d)(-)/g, "$1 -")
	var reg = /((?:-?[\d]*)\.\d+)((?:\.\d+)+)/g
	while (reg.test(path)) {
		path = path.replace(reg, "$1 $2")
	}
	var list = path.split(" ")
	var prev = ""
	var j = 0
	var i = 0
	segs = []

	while (i<list.length) {
		//var s = new Segment()
		segs[j] = new Segment()

		if (list[i].charCodeAt(0)>64) {
			segs[j].t = list[i++]
		} else {
			if (prev == "")
				break
			segs[j].t = prev == "M" ? "L" : prev == "m" ? "l" : prev
		}
		prev = segs[j].t

		switch (segs[j].t) {
		case "Z":
		case "z":
			break
		case "M":
		case "m":
			segs[j].x = +list[i++]
			segs[j].y = +list[i++]
			break
		case "L":
		case "l":
			segs[j].x = +list[i++]
			segs[j].y = +list[i++]
			break
		case "H":
		case "h":
			segs[j].x = +list[i++]
			break
		case "V":
		case "v":
			segs[j].y = +list[i++]
			break
		case "A":
		case "a":
			segs[j].r1 = +list[i++]
			segs[j].r2 = +list[i++]
			segs[j].a = +list[i++]
			segs[j].af = +list[i++]
			segs[j].sf = +list[i++]
			segs[j].x = +list[i++]
			segs[j].y = +list[i++]
			break
		case "C":
		case "c":
			segs[j].x1 = +list[i++]
			segs[j].y1 = +list[i++]
			segs[j].x2 = +list[i++]
			segs[j].y2 = +list[i++]
			segs[j].x = +list[i++]
			segs[j].y = +list[i++]
			break
		case "Q":
		case "q":
			segs[j].x1 = +list[i++]
			segs[j].y1 = +list[i++]
			segs[j].x = +list[i++]
			segs[j].y = +list[i++]
			break
		case "S":
		case "s":
			segs[j].x2 = +list[i++]
			segs[j].y2 = +list[i++]
			segs[j].x = +list[i++]
			segs[j].y = +list[i++]
			break
		case "T":
		case "t":
			segs[j].x = +list[i++]
			segs[j].y = +list[i++]
			break
		default:
			i++
		}
		j++
	}
	segs[0].t = "M"
	checkdecimals()
}

this.scale = function (ratio) {
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]
		seg.x = seg.x==undefined ? undefined : ratio * seg.x
		seg.y = seg.y==undefined ? undefined : ratio * seg.y
		seg.x1 = seg.x1==undefined ? undefined : ratio * seg.x1
		seg.y1 = seg.y1==undefined ? undefined : ratio * seg.y1
		seg.x2 = seg.x2==undefined ? undefined : ratio * seg.x2
		seg.y2 = seg.y2==undefined ? undefined : ratio * seg.y2
		seg.r1 = seg.r1==undefined ? undefined : ratio * seg.r1
		seg.r2 = seg.r2==undefined ? undefined : ratio * seg.r2
		seg.a = seg.a==undefined ? undefined : ratio * seg.a
	}
	checkdecimals()
}

this.move = function(dx, dy) {
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]
		switch (seg.t) {
		case 'M':
		case 'L':
		case 'H':
		case 'V':
		case 'A':
		case 'C':
		case 'Q':
		case 'S':
		case 'T':
			seg.x = seg.x==undefined ? undefined : seg.x + dx
			seg.y = seg.y==undefined ? undefined : seg.y + dy
			seg.x1 = seg.x1==undefined ? undefined : seg.x1 + dx
			seg.y1 = seg.y1==undefined ? undefined : seg.y1 + dy
			seg.x2 = seg.x2==undefined ? undefined : seg.x2 + dx
			seg.y2 = seg.y2==undefined ? undefined : seg.y2 + dy
			break
		}
	}
	checkdecimals()
}

this.absolute = function() {
	var curx=0, cury=0
	var begx=0, begy=0
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]
		switch (seg.t) {
		case 'Z':
		case 'z':
			seg.t = 'Z'
			curx = begx
			cury = begy
			break
		case 'M':
			begx = seg.x
			begy = seg.y
			curx = seg.x
			cury = seg.y
			break
		case 'L':
		case 'A':
		case 'C':
		case 'Q':
		case 'S':
		case 'T':
			curx = seg.x
			cury = seg.y
			break
		case 'H':
			curx = seg.x
			break
		case 'V':
			cury = seg.y
			break
		case 'm':
			seg.x += curx
			seg.y += cury
			curx = seg.x
			cury = seg.y
			seg.t = 'M'
			break
		case 'l':
			seg.x += curx
			seg.y += cury
			curx = seg.x
			cury = seg.y
			seg.t = 'L'
			break
		case 'h':
			seg.x += curx
			curx = seg.x
			seg.t = 'H'
			break
		case 'v':
			seg.y += cury
			cury = seg.y
			seg.t = 'V'
			break
		case 'a':
			seg.x += curx
			seg.y += cury
			curx = seg.x
			cury = seg.y
			seg.t = 'A'
			break
		case 'c':
			seg.x += curx
			seg.y += cury
			seg.x1 += curx
			seg.y1 += cury
			seg.x2 += curx
			seg.y2 += cury
			curx = seg.x
			cury = seg.y
			seg.t = 'C'
			break
		case 'q':
			seg.x += curx
			seg.y += cury
			seg.x1 += curx
			seg.y1 += cury
			curx = seg.x
			cury = seg.y
			seg.t = 'Q'
			break
		case 's':
			seg.x += curx
			seg.y += cury
			seg.x2 += curx
			seg.y2 += cury
			curx = seg.x
			cury = seg.y
			seg.t = 'S'
			break
		case 't':
			seg.x += curx
			seg.y += cury
			curx = seg.x
			cury = seg.y
			seg.t = 'T'
			break
		}
	}
	checkdecimals()
}

this.path = function() {
	var path = ""
	var prev = ""
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]
		switch (seg.t) {
		case 'Z':
		case 'z':
			path += seg.t
			break
		case "M":
		case "m":
			path += seg.t + seg.x + " " + seg.y
			break
		case "L":
			path += (prev==seg.t || prev=="M") ? " " : "L"
			path += seg.x + " " + seg.y
			break
		case "l":
			path += (prev==seg.t || prev=="m") ? " " : "l"
			path += seg.x + " " + seg.y
			break
		case "H":
		case "h":
			path += prev==seg.t ? " " : seg.t
			path += seg.x
			break
		case "V":
		case "v":
			path += prev==seg.t ? " " : seg.t
			path += seg.y
			break
		case "A":
		case "a":
			path += prev==seg.t ? " " : seg.t
			path += seg.r1 + " " + seg.r2 + " " + seg.a + " " + seg.af + " " + seg.sf + " " + seg.x + " " + seg.y
			break
		case "C":
		case "c":
			path += prev==seg.t ? " " : seg.t
			path += seg.x1 + " " + seg.y1 + " " + seg.x2 + " " + seg.y2 + " " + seg.x + " " + seg.y
			break
		case "Q":
		case "q":
			path += prev==seg.t ? " " : seg.t
			path += seg.x1 + " " + seg.y1 + " " + seg.x + " " + seg.y
			break
		case "S":
		case "s":
			path += prev==seg.t ? " " : seg.t
			path += seg.x2 + " " + seg.y2 + " " + seg.x + " " + seg.y
			break
		case "T":
		case "t":
			path += prev==seg.t ? " " : seg.t
			path += seg.x + " " + seg.y
			break
		}
		prev = seg.t
	}
	path = path.replace(/ -/g, "-")
	path = path.replace(/-0\./g, "-.")
	path = path.replace(/ 0\./g, " .")
	//path = path.replace(/([A-Za-z]\d) \./g, "$1#.")
	//path = path.replace(/ \./g, ".")	
	//path = path.replace(/#/g, " ")
	return path
}

function checkdecimals() {
	if (ifcheckdecimals) {
		self.round(decs)
	}
}

this.round = function(dec) {
	dec = dec==undefined ? 0 : dec
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]
		seg.x = seg.x==undefined ? undefined : rounddec(seg.x, dec)
		seg.y = seg.y==undefined ? undefined : rounddec(seg.y, dec)
		seg.x1 = seg.x1==undefined ? undefined : rounddec(seg.x1, dec)
		seg.y1 = seg.y1==undefined ? undefined : rounddec(seg.y1, dec)
		seg.x2 = seg.x2==undefined ? undefined : rounddec(seg.x2, dec)
		seg.y2 = seg.y2==undefined ? undefined : rounddec(seg.y2, dec)
		seg.r1 = seg.r1==undefined ? undefined : rounddec(seg.r1, dec)
		seg.r2 = seg.r2==undefined ? undefined : rounddec(seg.r2, dec)
		seg.a = seg.a==undefined ? undefined : rounddec(seg.a, dec)
	}
}

function rounddec(num, dec) {
	if (num % 1 === 0)
		return num
	else if (dec==0) {
		return Math.round(num)
	} else {
		var pow = Math.pow(10, dec)
		return Math.round(num * pow) / pow
	}
}

function validateViewbox(vb) {
	if (vb.length != 4) {
		return false
	}
	var re = /^-{0,1}\d*$/
	if (!re.test(vb[0])||!re.test(vb[1])||!re.test(vb[2])||!re.test(vb[3])) {
		return false
	}
	/*vbx = vb[2]-vb[0]
	vby = vb[3]-vb[1]*/
	return true
}

this.table = function() {
	var str = ""
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i]

		var x = seg.x==undefined ? "" : seg.x
		var y = seg.y==undefined ? "" : seg.y
		var x1 = seg.x1==undefined ? "" : seg.x1
		var y1 = seg.y1==undefined ? "" : seg.y1
		var x2 = seg.x2==undefined ? "" : seg.x2
		var y2 = seg.y2==undefined ? "" : seg.y2
		var r1 = seg.r1==undefined ? "" : seg.r1
		var r2 = seg.r2==undefined ? "" : seg.r2
		var a = seg.a==undefined ? "" : seg.a
		var af = seg.af==undefined ? "" : seg.af ? "1" : "0"
		var sf = seg.sf==undefined ? "" : seg.sf ? "1" : "0"

		str += "<div id='s0_"+ i +"' class='set'>"
		str += "<div>" + seg.t + "</div>"
		str += "<div>" + x + "</div>"
		str += "<div>" + y + "</div>"
		str += "<div>" + x1 + "</div>"
		str += "<div>" + y1 + "</div>"
		str += "<div>" + x2 + "</div>"
		str += "<div>" + y2 + "</div>"
		str += "<div>" + r1 + "</div>"
		str += "<div>" + r2 + "</div>"
		str += "<div>" + a + "</div>"
		str += "<div>" + af + "</div>"
		str += "<div>" + sf + "</div>"
		str += "</div>"
	}
	return str
}

}
