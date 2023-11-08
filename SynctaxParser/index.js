import { scan } from "../LexParser.js";

const syntaxMap = {
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
  },
  hash = {};

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
    if (symbol.match(/^\$/)) return;

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

function parse(source) {
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

const evaluator = {
  Program: function (node) {
    return evaluat(node.children[0]);
  },
  StatementList: function (node) {
    switch (node.children.length) {
      case 1:
        return evaluat(node.children[0]);
      default:
        // StatementList: [["Statement"], ["StatementList", "Statement"]],
        // 第二种情况就全部执行一下
        evaluat(node.children[0]);
        return evaluat(node.children[1]);
    }
  },
  Statement: function (node) {
    return evaluat(node.children[0]);
  },
  VariableDeclaration: function (node) {
    // debugger;
    // log(node) 获取表达式声明体
    console.log(node.children[1].name);

    return evaluat(node.children[1]);
  },
  EOF: function () {
    return null;
  },
};

// 每一次去执行树中的某一个节点
function evaluat(node) {
  if (evaluator[node.type]) return evaluator[node.type](node);
}

/////////////////////////////
const source = `
 var a;
 var b;
`;
let lexicalTree = parse(source);
evaluat(lexicalTree);
