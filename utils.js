const is = require('is-type-of');
const { file } = require('ys-utils');

exports.getProperties = getProperties;
exports.getExports = getExports;
exports.defaultCamelize = defaultCamelize;
exports.getInstance = getInstance;

class ClassLoader {
  constructor(options) {
    if (!options.ctx) {
      throw new Error('options.ctx is required');
    }
    const properties = options.properties;
    this._cache = new Map();
    this._ctx = options.ctx;

    for (const property in properties) {
      this.defineProperty(property, properties[property], options.runtime);
    }
  }

  defineProperty(property, values, runtime) {
    Object.defineProperty(this, property, {
      get() {
        let instance = this._cache.get(property);
        if (!instance) {
          instance = getInstance(values, this._ctx, runtime);
          this._cache.set(property, instance);
        }
        return instance;
      },
    });
  }
}

function getExports(fullpath, { initializer, call, inject }, pathName) {
  let result = file.load(fullpath);
  if (initializer) {
    result = initializer(result, { path: fullpath, pathName });
  }

  if (is.class(result) || is.generatorFunction(result) || is.asyncFunction(result)) {
    return result;
  }

  if (call && is.function(result)) {
    result = result(inject);
    if (result != null) {
      return result;
    }
  }

  return result;
}

function getProperties(filepath, { caseStyle, lowercaseFirst }) {
  // if caseStyle is function, return the result of function
  if (typeof caseStyle === 'function') {
    const result = caseStyle(filepath);
    if (!Array.isArray(result)) {
      throw new Error(`caseStyle expect an array, but got ${result}`);
    }
    return result;
  }
  // use default camelize
  return defaultCamelize(filepath, caseStyle, lowercaseFirst);
}

function defaultCamelize(filepath, caseStyle, lowercaseFirst) {
  const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  return properties.map(property => {
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }

    // use default camelize, will capitalize the first letter
    // foo_bar.js > FooBar
    // fooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > fooBar (if lowercaseFirst is true)
    property = property.replace(/[_-][a-z]/ig, s => s.substring(1).toUpperCase());
    let first = property[0];
    switch (caseStyle) {
      case 'lower':
        first = first.toLowerCase();
        break;
      case 'upper':
        first = first.toUpperCase();
        break;
      case 'camel':
      default:
    }
    if (lowercaseFirst) first = first.toLowerCase();
    return first + property.substring(1);
  });
}

function getInstance(values, ctx, runtime) {
  // it's a directory when it has no exports
  // then use ClassLoader
  const Class = values.EXPORTS ? values : null;
  let instance;
  if (Class) {
    if (is.class(Class)) {
      instance = runtime(Class, ctx);
    } else {
      // it's just an object
      instance = Class;
    }
  // Can't set property to primitive, so check again
  // e.x. module.exports = 1;
  } else if (is.primitive(values)) {
    instance = values;
  } else {
    instance = new ClassLoader({ ctx, properties: values, runtime });
  }
  return instance;
}

exports.ClassLoader = ClassLoader;