const fs = require('fs');
const path = require('path');

const readfile = filename => fs.readFileSync(filename, 'utf-8');
const prefixdir = pathname => filename => path.join(pathname, filename);

exports.readfile = readfile;
exports.prefixdir = prefixdir;

exports.readdir = pathname => fs.readdirSync(pathname);

exports.readmsgkey = filename => readfile(filename).split(/\s+/g)[1];
