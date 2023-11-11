// Js 将变量存储在 ExecutionContext 的上下文中
export class ExecutionContext {
  constructor(realm, lexicalEnvironment, variableEnvironment) {
    variableEnvironment = variableEnvironment || lexicalEnvironment
    this.lexicalEnvironment = lexicalEnvironment
    this.variableEnvironment = variableEnvironment;
    this.realm = realm; // 存储 Global Object Object.prototype
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
    this.object[this.property] = value
  }

  get() {
    return this.object[this.property]
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

export class EnvironmentRecord {
  constructor() {
    this.thisValue
    this.variables = new Map()
    this.outer = null
  }
}

