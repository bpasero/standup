'use strict';

module.exports.shuffleArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
	
    return array;
}

module.exports.clone = function(obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}
	
	var result = (Array.isArray(obj)) ? [] : {};
	Object.keys(obj).forEach(function(key) {
		if (obj[key] && typeof obj[key] === 'object') {
			result[key] = module.exports.shuffleArray(obj[key]);
		} else {
			result[key] = obj[key];
		}
	});
	
	return result;
}