import { scan } from "./LexParser.js";

const syntaxMap = {
    Program: [["StatementList", "EOF"]],
    StatementList: [["Statement"], ["StatementList", "Statement"]],
    Statement: [
      ["ExpressionStatement"],
      ["IfStatement"],
      ["WhileStatement"],
      ["VariableDeclaration"],
      ["FunctionDeclaration"],
      ["BlockStatement"],
      ["BreakStatement"],
      ["ContinueStatement"]
    ],
    BreakStatement: [
      ["break", ";"]
    ],
    ContinueStatement: [
      ["continue", ";"]
    ],
    BlockStatement: [
      ["{", "StatementList", "}"],
      ["{", "}"]
    ],
    IfStatement: [
      ["if", "(", "Expression", ")", "Statement"]
    ],
    WhileStatement: [
      ["while", "(", "Expression", ")", "Statement"]
    ],
    VariableDeclaration: [
      ["var", "Identifier", ";"],
      ["let", "Identifier", ";"],
    ],
    FunctionDeclaration: [
      ["function", "Identifier", "(", ")", "{", "StatementList", "}"],
    ],
    ExpressionStatement: [["Expression", ";"]],
    Expression: [["AssignmentExpression"]],
    AssignmentExpression: [
      ["LeftHandSideExpression", "=", "LogicalORExpression"],
      ["LogicalORExpression"],
    ],
    LogicalORExpression: [
      ["LogicalANDExpression"],
      ["LogicalORExpression", "||", "LogicalANDExpression"],
    ],
    LogicalANDExpression: [
      ["AdditiveExpression"],
      ["LogicalANDExpression", "&&", "AdditiveExpression"],
    ],
    AdditiveExpression: [
      ["MultiplicativeExpression"],
      ["AdditiveExpression", "+", "MultiplicativeExpression"],
      ["AdditiveExpression", "-", "MultiplicativeExpression"],
    ],
    MultiplicativeExpression: [
      ["LeftHandSideExpression"],
      ["MultiplicativeExpression", "*", "LeftHandSideExpression"],
      ["MultiplicativeExpression", "/", "LeftHandSideExpression"],
    ],
    MemberExpression: [
      ["PrimaryExpression"],
      ["PrimaryExpression", ".", "Identifier"],
      ["PrimaryExpression", "[", "Expression", "]"],
    ] /* new fn()() || new fn().a() 需要额外注意的是这里的优先级 */,
    LeftHandSideExpression: [["CallExpression"], ["NewExpression"]],
    CallExpression: [
      ["MemberExpression", "Arguments"],
      ["CallExpression", "Arguments"],
    ] /* new fn() */,
    NewExpression: [
      ["MemberExpression"],
      ["new", "NewExpression"],
    ] /* new fn */,
    PrimaryExpression: [["(", "Expression", ")"], ["Literal"], ["Identifier"]],
    Literal: [
      ["NumericLiteral"] /*Number类型默认用于表示双精度浮点数*/,
      ["StringLiteral"] /*JavaScript中的String类型使用UTF-16编码*/,
      ["BooleanLiteral"],
      ["NullLiteral"],
      ["RegularExpression"],
      [
        "ObjectLiteral",
      ] /*Javascript property 对行为和状态并没有一个明确的区分*/,
      ["ArrayLiteral"],
    ],
    ObjectLiteral: [
      ["{", "}"],
      ["{", "PropertyList", "}"],
    ],
    PropertyList: [["Property"], ["PropertyList", ",", "Property"]],
    Property: [
      ["StringLiteral", ":", "AdditiveExpression"],
      ["Identifier", ":", "AdditiveExpression"],
    ],
  },
  hash = {};

// 状态机
function closure(state) {
  hash[JSON.stringify(state)] = state; // 在数据污染之前备份数据
  const queue = [];

  for (let symbol in state) {
    if (symbol.match(/^\$/)) continue; // 将 $reduceState 排除, 不做为普通的状态进行迁移
    queue.push(symbol); // 广度优先
  }
  // 提取每一个 symbol，根据 syntax 规则去进行展开 此时只处理了两层
  while (queue.length) {
    const symbol = queue.shift();
    // console.log(symbol);

    if (syntaxMap[symbol]) {
      for (let rule of syntaxMap[symbol]) {
        if (!state[rule[0]]) queue.push(rule[0]);
        let current = state;
        for (const part of rule) {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        // 在术语中用 reduce 来代指合并，reduce 有两个要素
        // 1. 将不定个 non-terminal-symbol 合并，所以需要回退状态
        // 2. 要 reduce 成一个什么样的 symbol
        current.$reduceType = symbol;
        current.$reduceLength = rule.length;
      }
    }
  }

  //
  for (const symbol in state) {
    if (symbol.match(/^\$/)) continue;

    if (hash[JSON.stringify(state[symbol])]) {
      state[symbol] = hash[JSON.stringify(state[symbol])];
    } else {
      closure(state[symbol]);
    }
  }
}

// 如果把语法的分析过程看做一个状态迁移的过程 就是从 start 到 end 的过程
const end = {
  $isEnd: true,
};
const start = {
  Program: end,
};

closure(start);
// console.log(start);

export function parse(source) {
  let stack = [start];
  let symbolStack = [];

  // 处理的是子元素
  function reduce() {
    let state = stack[stack.length - 1];
    // 生成新的 _symbol
    if (state.$reduceType) {
      let children = [];
      for (let i = 0; i < state.$reduceLength; i++) {
        stack.pop();
        children.push(symbolStack.pop());
      }

      // reduce to non-terminal-symbol and shift it
      return {
        type: state.$reduceType,
        children: children.reverse(),
      };
    } else {
      console.log(state);
      throw new Error("unexpected token");
    }
  }

  function shift(symbol) {
    let state = stack[stack.length - 1];
    if (symbol && symbol.type in state) {
      stack.push(state[symbol.type]); // 储存状态
      symbolStack.push(symbol);
    } else {
      // reduce to non-terminal-symbol
      // reduce 产生的新的 symbol 没有入栈，需要再次 shift
      shift(reduce());
      shift(symbol);
    }
  }

  for (let symbol /* terminal symbols */ of scan(source)) {
    shift(symbol);
    // console.log(symbol);
  }
  return reduce();
}
