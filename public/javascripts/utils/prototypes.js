/**
 * Capitalize String
 * @returns {string}
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Return first key of array like object
 * @returns {*}
 *
Object.prototype.firstKey = function() {
    return Object.keys(this)[0];
};*/