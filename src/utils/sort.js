/* eslint prefer-arrow-callback: "off", func-names : "off", no-unused-vars : "off" */
module.exports.sortAlpha = function (prop, descendingOrder, caseSensitive) {
	return function (a, b) {
		a = prop ? a[prop] : a
		b = prop ? b[prop] : b
		a = caseSensitive ? a : a.toLowerCase()
		b = caseSensitive ? b : b.toLowerCase()
		let result
		if (a > b) { result = 1 } else if (a < b) { result = -1 } else { result = 0 }
		return descendingOrder ? result : result * (-1)
	}
}
