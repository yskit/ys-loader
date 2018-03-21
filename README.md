# ys-loader

[YS](https://github.com/yskit/ys-mutify) 架构之基础辅助加载模块。

# Install

```shell
npm i --save ys-loader
```

# Usage

```javascript
const { FileLoader, ContextLoader, util } = require('ys-loader')
```

`FileLoader`与`ContextLoader`都具有如下的属性特征：

| 属性 | 类型 | 默认值 | 说明 |
| :---: | :---: | :---: | :---: |
| directory | `string` | null | 需要解析文件的文件夹 |
| match | `array` | `['**/*.js']` | 匹配规则，规则详见 [npm:globby](https://www.npmjs.com/package/globby) 模块 |
| ignore | `array` | `[]` | 过滤某种规则的文件，规则详见 [npm:globby](https://www.npmjs.com/package/globby) 模块 |
| lowercaseFirst | `boolean` | true | 解析出来文件变量的首字母是否小写 |
| caseStyle | `string` | camel | 变量规则模式，支持 `lower` `upper` `camel` 三种 |
| initializer | `function` | null | 初始化自定义变量以及内容结构的方法 |
| call | `boolean` | true | 是否执行注入 |
| inject | `object` | null | 注入对象，需要开启`call`选项 |
| override | `boolean` | false | 是否覆盖变量，如果遇到冲突 |
| target | `object` | null | 结果继承到target对象上 |
| runtime | `function` | null | 在处理`class`类型文件模块的时候，我们将该模块编译的方式 |

## FileLoader

文件加载器，不编译，如果需要编译，使用`initializer`属性。

```javascript
new FileLoader(options).load();
```

## ContextLoader

对象加载器，会编译`class`文件模块，如果自定义编译方式，请使用`runtime`属性

```javascript
new ContextLoader(options).load();
```

## Utils

```javascript
const {
  getProperties,
  getExports,
  defaultCamelize,
  getInstance
} = utils;
```

具体各自用法请看源码。

# License

It is [MIT licensed](https://opensource.org/licenses/MIT).