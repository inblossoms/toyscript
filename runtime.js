// Js 将变量存储在 ExecutionContext 的上下文中
export class ExecutionContext {
  constructor(realm, lexicalEnvironment, variableEnvironment) {
    variableEnvironment = variableEnvironment || lexicalEnvironment
    this.lexicalEnvironment = lexicalEnvironment
    this.variableEnvironment = variableEnvironment;
    this.realm = realm; // 存储 Global Object Object.prototype
  }
}

export class EnvironmentRecord {
  constructor(outer) {
    this.outer = outer; // 外层作用域
    this.variables = new Map()
  }

  add(name) {
    this.variables.set(name, new JsUndefined())
  }

  get(name) {
    if (this.variables.get(name)) {
      return this.variables.get(name)
    } else if (this.outer) {
      return this.outer.get(name)
    } else {
      return new JsUndefined()
    }
  }

  set(name, value = new JsUndefined()) {
    if (this.variables.get(name)) {
      return this.variables.set(name, value)
    } else if (this.outer) {
      return this.outer.set(name, value)
    } else {
      return this.variables.set(name, value)
    }
  }
}

export class ObjectEnvironmentRecord {
  constructor(object, outer) {
    this.object = object;
    this.outer = outer;
  }

  add(name) {
    this.object.set(name, new JsUndefined())
  }

  get(name) {
    return this.object.get(name)
    // TODO with statement need outer
  }

  set(name, value = new JsUndefined()) {
    this.object.set(name, value)
    // TODO with statement need outer
  }
}

// Js 运行时机制：所有的对象属性的访问都涉及到 reference（运行时类型）
// 将变量名 上下文 值 通过一个对象进行存储
export class Reference {
  constructor(object, property) {
    this.object = object;
    this.property = property
  }

  set(value) {
    this.object.set(this.property, value)
  }

  get() {
    return this.object.get(this.property)
  }
}

export class Realm {
  constructor() {
    this.global = new Map()
    this.Object = new Map()
    this.Object_prototype = new Map()
    this.Object.call = function () {
    }
  }
}

// 为什么需要做类型转换？
// 因为我们在做条件逻辑的时候依赖了底层的 if，这会导致一个问题就是：
//  上下文可能是不一致的
export class JsValue {
  get type() {
    if (this.constructor === JsNumber) {
      return 'number';
    }
    if (this.constructor === JsString) {
      return 'string';
    }
    if (this.constructor === JsBoolean) {
      return 'boolean';
    }
    if (this.constructor === JsObject) {
      return 'object';
    }
    if (this.constructor === JsNull) {
      // if retrun "object" 那么行为就和 Javascript null 行为一样了
      return 'null';
    }
    if (this.constructor === JsSymbol) {
      return 'symbol';
    }
    return 'undefined'; // 默认 undefined 状态
  }
}

export class JsNumber extends JsValue {
  constructor(value) {
    super();
    this.memory = new ArrayBuffer(8)
    if (arguments.length)
      new Float64Array(this.memory)[0] = value;
    else
      new Float64Array(this.memory)[0] = 0;
  }

  get value() {
    return new Float64Array(this.memory)[0];
  }

  toString() {
    // TODO 10 进制: number to string
  }

  toNumber() {
    return this;
  }

  toBoolean() {
    if (new Float64Array(this.memory)[0] === 0) {
      return new JsBoolean(false)
    } else {
      return new JsBoolean(true)
    }
  }

  // toObject(){}
}

export class JsString extends JsValue {
  constructor(characters) { // js 中的字符串 length 属性在创建时定义 不可以被修改
    super();
    // this.memory = new ArrayBuffer(characters.length * 2); // utf16
    // 正确的应该是按照 utf-16 的方式进行存储
    this.characters = characters;
  }

  toString() {
    return this.characters;
  }

  toNumber() {
    // TODO string to number
  }

  toBoolean() {
    if (new Float64Array(this.memory)[0] === 0) {
      return new JsBoolean(false)
    } else {
      return new JsBoolean(true)
    }
  }
}

export class JsBoolean extends JsValue {
  constructor(value) {
    super();
    this.value = value || false;
  }

  toString() {
    if (this.value) {
      return new JsString(['t', 'r', 'u', 'e']);
    }
    return new JsString(['f', 'a', 'l', 's', 'e']);
  }

  toNumber() {
    if (this.value) {
      return new JsNumber(1);
    }
    return new JsNumber(0);
  }

  toBoolean() {
    return this;
  }
}

export class JsObject extends JsValue {
  constructor(proto) {
    super();
    this.properties = new Map();
    this.prototype = proto || null;
  }

  // Object 类型在处理时需要走原型链的逻辑
  // 所以在 get 的时候，需要有原型链和 getter 执行的过程
  get(name) {
    // TODO prototype chain && getter
    return this.getProperty(name).value
  }

  set(name, value) {
    // TODO writeable etc.
    this.setProperty(name, {
      value: value,
      enumerable: true,
      configurable: true,
      writeable: true
    })
  }

  // 构建原型
  setPrototype(proto) {
    this.prototype = proto;
  }

  getPrototype() {
    return this.prototype;
  }

  setProperty(name, attributes) {
    this.properties.set(name, attributes);
  }

  getProperty(name) {
    // TODO 原型链
    return this.properties.get(name)
  }
}

export class JsNull extends JsValue {
  toNumber() {
    return new JsNumber(0);
  }

  toString() {
    return new JsString(['n', 'u', 'l', 'l']);
  }

  toBoolean() {
    return new JsBoolean(false)
  }
}

export class JsUndefined extends JsValue {
  toNumber() {
    return new JsNumber(NaN);
  }

  toString() {
    return new JsString(['u', 'n', 'd', 'e', 'f', 'i', 'n', 'e', 'd']);
  }

  toBoolean() {
    return new JsBoolean(false)
  }
}

export class JsSymbol extends JsValue {
  constructor(name) {
    super();
    this.name = name || '';
  }
}

export class CompletionRecord {
  constructor(type, value, target) {
    this.type = type || 'normal';
    this.value = value || new JsUndefined;
    this.target = target || null;
  }
}
