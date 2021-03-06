// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill

module.exports = arg => {
  return Object.prototype.toString.call(arg) === '[object Array]';
};
