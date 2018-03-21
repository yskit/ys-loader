const FileLoader = require('./file_loader');
const utils = require('./utils');
const CLASSLOADER = Symbol('classLoader');

module.exports = class ContextLoader extends FileLoader {
  constructor(options) {
    if (!options.property) {
      throw new Error('options.property is required');
    }
    if (!options.inject) {
      throw new Error('options.inject is required');
    }
    const target = options.target = {};
    const runtime = options.runtime || function (Class, ctx) {
      return new Class(ctx);
    };
    if (options.fieldClass) {
      options.inject[options.fieldClass] = target;
    }
    super(options);

    const app = this.options.inject;
    const property = options.property;

    Object.defineProperty(app.context, property, {
      get() {
        if (!this[CLASSLOADER]) {
          this[CLASSLOADER] = new Map();
        }
        const classLoader = this[CLASSLOADER];

        let instance = classLoader.get(property);
        if (!instance) {
          instance = utils.getInstance(target, this, runtime);
          classLoader.set(property, instance);
        }
        return instance;
      },
    });
  }
}