import {
  Reference,
  ExecutionContext,
  EnvironmentRecord,
  Realm,
  JsObject,
  JsSymbol,
  JsNull,
  JsUndefined,
  JsNumber,
  JsString,
  JsBoolean,
  CompletionRecord,
  ObjectEnvironmentRecord,
} from "./runtime.js";

export class Evaluator {
  constructor() {
    this.realm = new Realm();
    // 执行上下文中的数据状态 在函数调用的时候切换
    // 通过栈来管理 ExecutionContext 在存储函数调用的先后时机
    this.globalObject = new JsObject();
    this.ecs = [
      new ExecutionContext(
        this.realm,
        new ObjectEnvironmentRecord(this.globalObject),
        new ObjectEnvironmentRecord(this.globalObject)
      ),
    ];
    this.log();
  }

  evaluateModule(node) {
    let globalEC = this.ecs[0],
      ec = new ExecutionContext(
        this.realm,
        new EnvironmentRecord(globalEC.lexicalEnvironment),
        new EnvironmentRecord(globalEC.lexicalEnvironment)
      );

    this.ecs.push(ec);
    let result = this.valueOf(node);
    this.ecs.pop();

    return result;
  }

  log() {
    this.globalObject.set("log", new JsObject());
    this.globalObject.get("log").call = (args) => {
      console.log(args);
    };
  }

  evaluate(node) {
    if (this[node.type]) {
      let r = this[node.type](node);
      // console.log(r)
      return r;
    }
  }

  Program(node) {
    return this.evaluate(node.children[0]);
  }

  StatementList(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    } else {
      const record = this.evaluate(node.children[0]);
      if (record.type === "normal") {
        return this.evaluate(node.children[1]);
      }
      return record;
    }
  }

  Statement(node) {
    return this.evaluate(node.children[0]);
  }

  IfStatement(node) {
    let condition = this.evaluate(node.children[2]);
    if (condition.property === "undefined" || condition.property === "NaN") {
      return new JsUndefined().toBoolean();
    }
    if (condition instanceof Reference) {
      condition = condition.get();
    }
    if (condition.toBoolean().value) {
      return this.evaluate(node.children[4]);
    }
  }

  WhileStatement(node) {
    while (true) {
      let condition = this.evaluate(node.children[2]);
      if (condition.property === "undefined" || condition.property === "NaN") {
        return new JsUndefined().toBoolean();
      }
      if (condition instanceof Reference) {
        condition = condition.get();
      }
      if (condition.toBoolean().value) {
        let record = this.evaluate(node.children[4]);
        if (record.type === "continue") {
          continue;
          // TODO
        } else if (record.type === "break") {
          return new CompletionRecord("normal"); // break 代表着循环截止了 否则一个 break 会截停多层循环了
        }
      } else {
        return new CompletionRecord("normal");
      }
    }
  }

  BreakStatement(node) {
    return new CompletionRecord("break");
  }

  ContinueStatement(node) {
    return new CompletionRecord("continue");
  }

  VariableDeclaration(node) {
    // log(node) 获取表达式声明体
    let runningEC = this.ecs[this.ecs.length - 1]; // 取栈顶
    runningEC.lexicalEnvironment.add(node.children[1].name);
    return new CompletionRecord("normal", new JsUndefined());
  }

  ExpressionStatement(node) {
    let result = this.evaluate(node.children[0]);
    if (result instanceof Reference) {
      result = result.get();
    }
    return new CompletionRecord("normal", result);
  }

  Expression(node) {
    return this.evaluate(node.children[0]);
  }

  AdditiveExpression(node) {
    if (node.children.length === 1) return this.evaluate(node.children[0]);
    else {
      let left = this.evaluate(node.children[0]),
        right = this.evaluate(node.children[2]);
      if (left instanceof Reference) left = left.get();
      if (right instanceof Reference) right = right.get();

      if (node.children[1].type === "+") {
        return new JsNumber(left.value + right.value);
      }
      if (node.children[1].type === "-") {
        return new JsNumber(left.value - right.value);
      }
    }
  }

  MultiplicativeExpression(node) {
    if (node.children.length === 1) return this.evaluate(node.children[0]);
    else {
      let left = this.evaluate(node.children[0]),
        right = this.evaluate(node.children[2]);
      if (left instanceof Reference) left = left.get();
      if (right instanceof Reference) right = left.get();

      if (node.children[1].type === "*") {
        return new JsNumber(left.value * right.value);
      }
      if (node.children[1].type === "/") {
        return new JsNumber(left.value / right.value);
      }
    }
  }

  PrimaryExpression(node) {
    if (node.children.length === 1) return this.evaluate(node.children[0]);
  }

  Literal(node) {
    return this.evaluate(node.children[0]);
  }

  NumericLiteral(node) {
    let str = node.value,
      len = str.length,
      value = 0, // 进制
      n = 10;

    if (str.match(/^0b/)) {
      n = 2;
      len -= 2;
    } else if (str.match(/^0o/)) {
      n = 8;
      len -= 2;
    } else if (str.match(/^0x/)) {
      n = 16;
      len -= 2;
    }

    while (len--) {
      // 处理 16 进制
      let char = str.charCodeAt(str.length - len - 1);
      if (char >= "a".charCodeAt(0) && char <= "f".charCodeAt(0)) {
        char = char - "a".charCodeAt(0) + 10;
      } else if (char >= "A".charCodeAt(0) && char <= "F".charCodeAt(0)) {
        char = char - "A".charCodeAt(0) + 10;
      } else if (char >= "0".charCodeAt(0) && char <= "9".charCodeAt(0)) {
        char -= "0".charCodeAt(0);
      } else {
        throw new Error("Invalid or unexpected token");
      }

      // 将数字字符转换为其对应的数字值
      value = value * n + char;
    }

    return new JsNumber(node.value);
  }

  StringLiteral(node) {
    const result = [];
    console.log(node.value);

    for (let i = 1, len = node.value.length - 1; i < len; i++) {
      switch (node.value[i]) {
        case "\\":
          ++i;
          const char = node.value[i],
            escapeCharMap = {
              // 默认处理 BMP 的字符集（0000 - ffff : 一个 utf-16 的资源）
              n: String.fromCharCode(0x000a),
              r: String.fromCharCode(0x000d),
              t: String.fromCharCode(0x0009),
              b: String.fromCharCode(0x0008),
              f: String.fromCharCode(0x000c),
              v: String.fromCharCode(0x000b),
              0: String.fromCharCode(0x0000),
              "\\": String.fromCharCode(0x005c),
              "'": String.fromCharCode(0x0027),
              '"': String.fromCharCode(0x0022),
            };
          if (char in escapeCharMap) {
            result.push(escapeCharMap[char]);
          } else {
            result.push(char);
          }
          break;
        default:
          result.push(node.value[i]);
          break;
      }
    }
    // console.log(result);
    return new JsString(result);
  }

  ObjectLiteral(node) {
    const len = node.children.length;
    if (len === 2) {
      return {};
    }
    if (len === 3) {
      const object = new JsObject(); // Js 的对象本质就是两个东西：prototype property
      this.PropertyList(node.children[1], object);
      // object.prototype =
      return object;
    }
  }

  PropertyList(node, object) {
    if (node.children.length === 1) {
      this.Property(node.children[0], object);
    } else {
      this.PropertyList(node.children[0], object);
      this.Property(node.children[2], object);
    }
  }

  Property(node, object) {
    let name;
    if (node.children[0].type === "Identifier") {
      name = node.children[0].name;
    } else if (node.children[0].type === "StringLiteral") {
      name = this.evaluate(node.children[0]);
    }
    object.setProperty(name, {
      value: this.evaluate(node.children[2]),
      writeable: true,
      enumerable: true,
      configurable: true,
    });
  }

  AssignmentExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    // 先执行左边的表达式，然后执行右边的表达式，最后将右边的值赋值给左边的变量
    let left = this.evaluate(node.children[0]);
    let right = this.evaluate(node.children[2]);
    left.set(right);
  }

  LogicalORExpression(node) {
    if (node.children.length === 1) return this.evaluate(node.children[0]);
    let res = this.evaluate(node.children[0]);
    if (res.value) return res.value;
    res = this.evaluate(node.children[2]);
    if (res.type === "null") return new JsNull();
    if (res.property === "undefined") return new JsUndefined();
    return this.evaluate(node.children[2]);
  }

  LogicalANDExpression(node) {
    if (node.children.length === 1) return this.evaluate(node.children[0]);
    let res = this.evaluate(node.children[0]);
    if (res.type === "null") return new JsNull();
    if (res.property === "undefined") return new JsUndefined();
    if (!res.value) return res.value;
    return this.evaluate(node.children[2]);
  }

  LeftHandSideExpression(node) {
    return this.evaluate(node.children[0]);
  }

  NewExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 2) {
      let _class = this.evaluate(node.children[1]);
      return _class.constructor();
    }
    /*
     * let object = this.realm.Object.constructor(),
     *   _class = this.evaluate(node.children[1]),
     *   result = _class.call(object);
     * if(typeof result === "object"){
     *   return result;
     * }
     * return object;
     */
  }

  CallExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 2) {
      let _function = this.evaluate(node.children[0]),
        _arguments = this.evaluate(node.children[1]);
      if (_function instanceof Reference) {
        _function = _function.get();
      }
      return _function.call(_arguments);
    }
    /*
     * let object = this.realm.Object.constructor(),
     *   _class = this.evaluate(node.children[1]),
     *   result = _class.call(object);
     * if(typeof result === "object"){
     *   return result;
     * }
     * return object;
     */
  }

  MemberExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 3) {
      const result = this.evaluate(node.children[0]).get(),
        prop = result.properties.get(node.children[2].name);
      if ("value" in prop) return prop.value;
      if ("get" in prop) return prop.get.call(result);
    }
  }

  Identifier(node) {
    // 将变量存储到 ExecutionContext
    let runningEC = this.ecs[this.ecs.length - 1]; // 取栈顶
    return new Reference(runningEC.lexicalEnvironment, node.name);
  }

  Arguments(node) {
    if (node.children.length === 2) {
      return [];
    } else {
      return this.evaluate(node.children[1]);
    }
  }

  ArgumentList(node) {
    if (node.children.length === 1) {
      let result = this.evaluate(node.children[0]);
      if (result instanceof Reference) {
        return result.get();
      }
      return [result];
    } else {
      let result = this.evaluate(node.children[2]);
      if (result instanceof Reference) {
        result = result.get();
      }
      return this.evaluate(node.children[0]).concat(result);
    }
  }

  BooleanLiteral(node) {
    if (node.value === "true") {
      return new JsBoolean(true);
    } else if (node.value === "false") {
      return new JsBoolean(false);
    }
  }

  NullLiteral(node) {
    if (typeof node.value === "object") {
      return new JsNull();
    }
  }

  BlockStatement(node) {
    if (node.children.length === 2) return;

    let runningEC = this.ecs[this.ecs.length - 1],
      ec = new ExecutionContext(
        runningEC.realm,
        new EnvironmentRecord(runningEC.lexicalEnvironment),
        runningEC.variableEnvironment
      );
    this.ecs.push(ec);
    let result = this.evaluate(node.children[1]);
    this.ecs.pop();

    return result;
  }

  FunctionDeclaration(node) {
    let name = node.children[1].name,
      code = node.children[node.children.length - 2],
      func = new JsObject();

    func.call = (args) => {
      let ec = new ExecutionContext(
        this.realm,
        new EnvironmentRecord(func.environment),
        new EnvironmentRecord(func.environment)
      );
      this.ecs.push(ec);
      this.evaluate(code);
      this.ecs.pop();
    };

    let runningEC = this.ecs[this.ecs.length - 1];
    runningEC.lexicalEnvironment.add(name);
    runningEC.lexicalEnvironment.set(name, func);
    func.environment = runningEC.lexicalEnvironment;
    return new CompletionRecord("normal");
  }
}
