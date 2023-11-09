class XRegExp {
  constructor(source, flag, root = "root") {
    this.table = new Map();
    this.regexp = new RegExp(this.compileRegExp(source, root, 0).source, flag);
  }

  exec(str) {
    let reg = this.regexp.exec(str);
    for (let i = 0, len = reg.length; i < len; i++) {
      if (reg[i] !== void 0) {
        reg[this.table.get(i - 1)] = reg[i];
        // console.log(this.table.get(i));
      }
    }
    return reg;
  }
  get lastIndex() {
    return this.regexp.lastIndexst;
  }
  set lastIndex(value) {
    this.regexp.lastIndex = value;
  }

  compileRegExp(source, literal, start) {
    if (source[literal] instanceof RegExp)
      return {
        source: source[literal].source,
        length: 0,
      };

    // 通过 length 计算每一个词法规则可以在 tabel 表中被找到
    let length = 0;
    let regexp = source[literal].replace(/\<([^>]+)\>/g, (str, $1) => {
      this.table.set(start + length, $1);
      // this.table.set($1, start + length)

      ++length;
      let reg = this.compileRegExp(source, $1, start + length);
      length += reg.length;

      return "(" + reg.source + ")";
    });

    return {
      source: regexp,
      length: length,
    };
  }
}

// Keywords 一定在 Identifer 之前，因为 Identifer 可能包含关键字
let regexp = new XRegExp(
  {
    InputElement: "<Whitespace>|<LineTerminator>|<Comments>|<Token>",
    Whitespace: / |\t/,
    LineTerminator: /\n|\r|\v/,
    Comments: /\/\*(?:[^*]|\*[^\/])*\*\/|\/\/[^\n\r\v]*/,
    Token: "<Literal>|<Keywords>|<Identifier>|<Punctuator>",
    Literal: "<NumericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>",
    NumericLiteral:
      /0o[0-7]+|0x[0-9a-fA-F]+|0b[01]+|(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/,
    StringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^'\n]|\\[\s\S])*\'/,
    BooleanLiteral: /true|false/,
    NullLiteral: /null/,
    Punctuator:
      /\+|\:|\(|\=|\<|\+\+|>|\]|\[|\*|\)|\{|\}|\?|\,|\.|\;|\/|\'|\"|\=\=/,
    Keywords:
      /let|const|var|break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|function|void|while|with|yield/,
    Identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
  },
  "g",
  "InputElement"
);

export function* scan(str) {
  //   console.log(regexp);
  while (
    regexp.regexp.lastIndex < str.length &&
    regexp.regexp.lastIndex !== -1
  ) {
    let r = regexp.exec(str);

    // console.log(r[0]);

    if (r.Whitespace) {
    } else if (r.LineTerminator) {
    } else if (r.Comments) {
    } else if (r.NumericLiteral) {
      yield {
        type: "NumericLiteral",
        value: r[0],
      };
    } else if (r.StringLiteral) {
      yield {
        type: "StringLiteral",
        value: r[0],
      };
    } else if (r.BooleanLiteral) {
      yield {
        type: "BooleanLiteral",
        value: r[0],
      };
    } else if (r.NullLiteral) {
      yield {
        type: "NullLiteral",
        value: null,
      };
    } else if (r.Identifier) {
      yield {
        type: "Identifier",
        name: r[0],
      };
    } else if (!r.Keywords) {
      if (r.Punctuator) {
        yield {
          type: r[0],
        };
      } else {
        throw new Error("unexpected token: " + r[0]);
      }
    } else {
      yield {
        type: r[0],
      };
    }

    // console.log(JSON.stringify(r[0]));
    // document.write(r[0]);
    if (!r[0].length) break;
  }

  yield {
    type: "EOF",
  };
}

const source = `
/*hello world*/
const x = 1;
for (let i = 0, len = 3; i < len; i++) {
 let doc = document.createElement("div")
 doc.innerText = 'lexer: ' + (i * 2) + ";"
 document.body.appendChild(doc)
}`;
