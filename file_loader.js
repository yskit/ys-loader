const is = require('is-type-of');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const globby = require('globby');
const defaults = {
  directory: null,
  match: undefined,
  ignore: undefined,
  lowercaseFirst: true,
  caseStyle: 'camel',
  initializer: null,
  call: true,
  inject: undefined,
  override: false,
  target: null
};

module.exports = class FileLoader {
  constructor(options) {
    this.options = Object.assign({}, defaults, options);;
  }

  load() {
    const items = this.parse();
    const target = this.options.target;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.properties.reduce((target, property, index) => {
        let obj;
        const properties = item.properties.slice(0, index + 1).join('.');
        if (index === item.properties.length - 1) {
          if (property in target) {
            if (!this.options.override) throw new Error(`can't overwrite property '${properties}' from ${target[property].FULLPATH} by ${item.fullpath}`);
          }
          obj = item.exports;
          if (obj && !is.primitive(obj)) {
            obj.FULLPATH = item.fullpath;
            obj.EXPORTS = true;
          }
        } else {
          obj = target[property] || {};
        }

        target[property] = obj;
        return obj;
      }, target);
    }
    return items.length;
  }

  parse() {
    let files = this.options.match || ['**/*.js'];
    files = Array.isArray(files) ? files : [files];
    let ignore = this.options.ignore;
    if (ignore) {
      ignore = Array.isArray(ignore) ? ignore : [ignore];
      ignore = ignore.filter(f => !!f).map(f => '!' + f);
      files = files.concat(ignore);
    }
    let directories = this.options.directory;
    if (!Array.isArray(directories)) {
      directories = [ directories ];
    }

    const items = [];

    for (const directory of directories) {
      const filepaths = globby.sync(files, { cwd: directory });
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);
        if (!fs.statSync(fullpath).isFile()) continue;
        const properties = utils.getProperties(filepath, this.options);
        const pathName = directory.split(/\/|\\/).slice(-1) + '.' + properties.join('.');
        const result = utils.getExports(fullpath, this.options, pathName);
        if (!result) continue;
        if (is.class(result)) {
          result.prototype.pathName = pathName;
          result.prototype.fullPath = fullpath;
        }
        items.push({ fullpath, properties, exports: result });
      }
    }

    return items;
  }
}