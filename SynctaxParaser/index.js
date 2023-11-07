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
    ["var", "Identifier"],
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

function closure(state) {
  hash[JSON.stringify(state)] = state; // 在数据污染之前备份数据
  const queue = [];

  for (let symbol in state) {
    queue.push(symbol); // 广度优先
  }
  // 提取每一个 symbol，根据 syntax 规则去进行展开
  while (queue.length) {
    const symbol = queue.shift();
    const syntax = syntaxMap[symbol];
    console.log(symbol);

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
        current.$isRuleEnd = true;
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
console.log(start);
