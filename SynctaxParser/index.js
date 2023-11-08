import { scan } from "../LexParser.js";

let syntaxMap = {
  Program: [["StatementList", "EOF"]],
  StatementList: [["Statement"], ["StatementList", "Statement"]],
  Statement: [
    ["ExpressionStatement"],
    ["IfStatement"],
    ["VariableDeclaration"],
    ["FunctionDeclaration"],
  ],
  IfStatement: [
    ["if", "(", "Expression", ")", "Statement"],
    // ["else", "Statement"],
    // ["else if", "(", "Expression", ")", "Statement"],
  ],
  VariableDeclaration: [
    // ["var", "Identifier", "=", "Expression", ";", "Statement"]
    ["var", "Identifier", ";"],
    ["let", "Identifier", ";"],
    ["const", "Identifier", ";"],
  ],
  FunctionDeclaration: [
    ["function", "Identifier", "(", ")", "{", "StatementList", "}"],
  ],
  ExpressionStatement: [["Expression", ";"]],
  Expression: [["AdditiveExpression"]],
  AdditiveExpression: [
    ["MultiplicativeExpression"],
    ["AdditiveExpression", "+", "MultiplicativeExpression"],
    ["AdditiveExpression", "-", "MultiplicativeExpression"],
  ],
  MultiplicativeExpression: [
    ["PrimaryExpression"],
    ["MultiplicativeExpression", "*", "PrimaryExpression"],
    ["MultiplicativeExpression", "/", "PrimaryExpression"],
  ],
  PrimaryExpression: [["(", "Expression", ")"], ["Literal"], ["Identifier"]],
  Literal: [["Number"]],
};

let hash = {};

// 状态机
function closure(state) {
  hash[JSON.stringify(state)] = state; // 在数据污染之前备份数据
  const queue = [];

  for (let symbol in state) {
    if (symbol.match(/^\$/)) return; // 将 $reduceState 排除, 不做为普通的状态进行迁移
    queue.push(symbol); // 广度优先
  }
  // 提取每一个 symbol，根据 syntax 规则去进行展开 此时只处理了两层
  while (queue.length) {
    const symbol = queue.shift();
    const syntax = syntaxMap[symbol];
    // console.log(symbol);

    if (syntax) {
      for (let rule of syntax) {
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
        current.$reduceState = state;
      }
    }
  }

  //
  for (const symbol in state) {
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

const source = `
	let a;
	a = 1;
`;

void (function parse(source) {
  let state = start;
  for (const iterator /* terminal symbols */ of scan(source)) {
    if (iterator.type in state) {
      state = state[iterator.type];
    } else {
      // reduce to non-terminal-symbol
      // 生成新的 symbol
      if (state.$reduceType) {
        state = state.$reduceState;
      }
    }
    console.log(iterator);
  }
})(source);
