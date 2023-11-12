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

// 为什么需要做类型转换？
// 因为我们在做条件逻辑的时候依赖了底层的 if，这会导致一个问题就是：
//  上下文可能是不一致的

export class JsValue {
  get type() {
    if(this.constructor === JsNumber){
      return "number";
    }
    if(this.constructor === JsString){
      return "string";
    }
    if(this.constructor === JsBoolean){
      return "boolean";
    }
    if(this.constructor === JsObject){
      return "object";
    }
    if(this.constructor === JsNull){
      // if retrun "object" 那么行为就和 Javascript null 行为一样了
      return "null";
    }
    if(this.constructor === JsSymbol){
      return "symbol";
    }
    return 'undefined'; // 默认 undefined 状态
  }
}

export class JsNumber extends JsValue {
  constructor(value) {
    super();
    this.memory = new ArrayBuffer(8)
    if(arguments.length)
      new Float64Array(this.memory)[0] = value;
    else
      new Float64Array(this.memory)[0] = 0;
  }

  get value(){
    return new Float64Array(this.memory)[0];
  }
  toString(){
    // TODO 10 进制: number to string
  }
  toNumber(){
    return this;
  }
  toBoolean(){
    if(new Float64Array(this.memory)[0] === 0){
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
    this.characters  = characters;
  }
  toString(){
    return this.characters;
  }
  toNumber(){
    // TODO string to number
  }
  toBoolean(){
    if(new Float64Array(this.memory)[0] === 0){
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
  toString(){
    if(this.value){
      return new JsString(['t', 'r', 'u', 'e']);
    }
    return new JsString(['f', 'a', 'l', 's', 'e']);
  }
  toNumber(){
    if(this.value){
      return new JsNumber(1);
    }
    return new JsNumber(0);
  }
  toBoolean(){
    return this;
  }
}

export class JsObject extends JsValue {
  constructor(proto) {
    super();
    this.properties = new Map();
    this.prototype = proto || null;
  }
  // 构建原型
  setPrototype(proto){
    this.prototype = proto;
  }
  getPrototype(){
    return this.prototype;
  }

  setProperty(name, attributes){
    this.properties.set(name, attributes);
  }

  getProperty(name, attributes){
    // TODO 原型链
  }
}

export class JsNull extends JsValue {
  toNumber(){
    return new JsNumber(0);
  }
  toString(){
    return new JsString(['n', 'u', 'l', 'l']);
  }
  toBoolean(){
    return new JsBoolean(false)
  }
}

export class JsUndefined extends JsValue {
  toNumber(){
    return new JsNumber(NaN);
  }
  toString(){
    return new JsString(['u', 'n', 'd', 'e', 'f', 'i', 'n', 'e', 'd']);
  }
  toBoolean(){
    return new JsBoolean(false)
  }
}

export class JsSymbol extends JsValue {
  constructor(name) {
    super();
    this.name = name || "";
  }
}

export class EnvironmentRecord {
  constructor() {
    this.thisValue
    this.variables = new Map()
    this.outer = null
  }
}

