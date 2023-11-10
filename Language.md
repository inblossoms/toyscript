# Js 语言通识以及结构化

## JavaScript 结构

- Atom 原子级 > 关键字
- Expression 表达式
- Statement 语句
  - 由于在 Js 语言本身的特性，所以语句的完成状态是不确定的
  - 这就需要有一个东西去存储最终的结果，这也就有了一个独有的数据结构：Completion Record
  - 因为在 Js 中是无法真正的访问到数据，它无法赋值给变量 同时也没有办法做为参数的任何环节
  - 中得到它，但是他又实打实的存在于运行中，它就存在了 Completion Record 中，它是一个对象，它有三个属性：
    - type: 类型 > normal break continue return or throw
    - value: 值 > 基本类型
    - target: 目标 > label
  - 简单语句：ExpressionStatement VariableStatement EmptyStatement DebuggerStatement ThrowStatement ContinueStatement BreakStatement ReturnStatement
  - 复合语句：BlockStatement ifStatement SwitchStatement IterationStatement(ForStatement ForInStatement WhileStatement DoWhileStatement) WithStatement LabelledStatement TryStatement
    - BlockStatement 可以是多条语句的集合
      **复合语句多用于控制简单语句的执行顺序, Completion Record 决定了语句是暂停还是向下执行**
  - 声明：VariableStatement VariableDeclaration FunctionDeclaration GeneratorDeclaration AsyncFunctionDeclaration AsyncGeneratorDeclaration ClassDeclaration LexicalDeclaration
  - 预处理：var let const 所有的声明都是有预处理机制的，都会把变量转变为局部变量。区别在于 let const 声明的变量在声明之前调用会报错且可以被 try catch 捕获
  - 作用域：作用域链的概念最早来自 es3 的作用域概念
- Structure
- Program/Module

## Js 结构化

### Js 执行粒度

- 宏任务
- 微任务
- 函数调用
- 语句/声明
- 表达式
- 直接量/变量/this

### Realm

Realm 的概念在 18 年之前都没有被很好的纳入到规范中。
规范规定了，在 Js 引擎的实例中，所有的内置对象会被放进一个 Realm 中，Realm 是一个全局对象。
不同的 Realm 是完全独立，所以在使用 instanceof 有时会失效。以及在使用 iframe 的时候，会发现它们的上下文环境是相互独立的。
不同的 Realm 之间是可以相互传递对象的，但是传递来的对象的 prototype 是不一致的。

在 Js 中，函数表达式和对象直接量均会创建对象，使用 . 做隐式转换也会创建对象。
这些对象也是有原型的，如果我们没有 Realm，就不知道它们的原型是什么。

## 语言按语法分类

1. 非形式语言

- 非形式语言，即没有语法结构的，比如自然语言，或者汉语。

2. 形式语言 - 乔姆斯基谱系：按照语言复杂度的文法分类

- 形式语言，即有语法结构的，比如英语，或者编程语言。形式语言的语法结构，就是语言的规则。
- 0 型：无限制文法
- 1 型：上下文相关文法
- 2 型：上下文无关文法
- 3 型：正则文法 （Regular）- 乔姆斯基谱系

### 产生式 BNF 巴克斯-诺尔范式

- 用 <> 括起来的名称来表示语法结构名
- 语法结构分为基础结构和需要用其他语法结构来扩展的复合结构
- 语法结构由产生式来表示
  - 产生式由三部分组成：非终结符 Nonterminal Symbol，终结符 Terminal Symbol，产生式右部
- 引号中间的字符表示终结符，引号外侧的字符表示非终结符
- 可以有括号、|（表示或）、\*（重复多次）、+（表示至少一次）

JavaScript 从引擎实现的一个广泛的角度上来看，是一个 2 型的语言文法。在对于个别的特殊语法，则采用 1 型的语言文法。

> 现在在国际上更流行的是 EBNF(BNF 扩展) 范式

### 语言的定义

- 语言可以由一个非终结符和它的产生式来定义

现代的编程语言都离不开乔姆斯基谱系中定义的正则文法和上下文无关文法，大部分语言都会有一个两部的处理法。
大部分语言会同时定义两份规范，词法规范和语法规范。

词法：词法过程按照正则文法去处理语言，最终会得到语言中基本的分词。词法就是将符号和有效内容 token 分开。

语法：等到我们拿到了这些 token 组成的流的时候再去做语法解析，此时语法上就会将其当做为一个 II 型语言来处理。
对于这里的语法树，如果我们尝试去除其中的无效信息，他将会变为我们的 AST 语法树。

### 语法树

- 把一段具体的语言的文本，根据产生式以属性结构来表示。
- 语法树并不和 AST 等同，即使都是编译器在解析源代码时所创建的数据结构：

  1. 语法树是编译器在解析源代码时所创建的一种树形结构，它以源代码中的语法规则为基础，将源代码分解成一个个的语法单元，然后将这些语法单元按照其在源代码中的层次关系组织成一棵树。语法树的节点包含了源代码中的所有信息，包括关键字、标识符、运算符等等。
  2. AST 是在语法树的基础上进一步抽象和简化而来的一种树形结构，它去掉了语法树中的一些冗余信息，只保留了与程序运行相关的信息。AST 的节点只包含了程序运行所需的信息，比如变量名、函数名、常量值等等。用于代码结构的处理，做一些翻译的工作：babel。

### 语言的分类

1. 形式语言按照用途来划分

- 数据描述型语言：JSON HTML XAML SQL CSS
- 编程语言：Java Python JS C

2. 表达方式划分

- 声明式语言：SQL CSS
- 命令式语言：Java Python JS C

### 图灵完备性

下面是计算机语言的两个流派：

1. 命令式 - 图灵机：通过 goto 或者 if while 都可以实现完整的图灵完备性的
2. 声明式 - lambda（邱琦提出的 lambda 演算）：可以通过递归实现的一种图灵完备的能力

### 动态和静态

1. 动态：

- 在用户的设备/在线服务器上
- 产品实际运行时
- Runtime

2. 静态：

- 在程序员的设备上
- 产品开发时
- Compiletime

## 用产生式来定义 Js 的词法和语法

```
// 顶层词法 InputElement
InputElement ::= WhiteSpace | LineTerminator | Comment | Token

WhiteSpace ::= " " | "	"

LineTerminator ::= "\n" | "\r"

Comment ::= SingleLineComment | MultilineComment
SingleLineComment ::= "/""/" <any>*
MultilineComment ::= "/""*" ([^*] | "*"[^!/])* "*""/"

Token ::= Literal | Keywords | Identifier | Punctuator
Literal ::= NumberLiteral | BooleanLiteral | StringLiteral | NullLiteral
Keywords ::= "if" | "else" | "for" | "function" | "while" | ...
Punctuator ::= "+" | "-" | "*" | "/" | "{" | ...       在 Js 产生式标准把 "/" 由于和正则语法冲突、"}" 和字符串中的模板插值语法冲突被排除在外了

... ...

// 语法
Program ::= Statement+

Statement ::= ExpressionStatement | IfStatement | ForStatement | WhileStatement
			  | VariableDeclaration | FunctionDeclaration | ClassDeclaration
			  | BreakStatement | ContinueStatement | ReturnStatement | ThrowStatement
			  | TryStatement | DebuggerStatement | BlockStatement |....

IfStatement ::= "if" "(" Expression ")" Statement
BlockStatement ::= "{" Expression "}"
TryStatement ::= "try""{" Statement+ "}" "catch""(" Expression ")""{" Statement+ "}"

ExpressionStatement ::= Expression ";"
Expression ::= AdditiveExpression
AdditiveExpression ::= MultiplicativeExpression
					   | AdditiveExpression ("+" | "-") MultiplicativeExpression
MultiplicativeExpression ::= UnaryExpression
							 | MultiplicativeExpression ("*" | "/") UnaryExpression

UnaryExpression ::= PrimaryExpression | ("+" | "-" | "typeof") PrimaryExpression
PrimaryExpression ::= "(" Expression ")" | Literal | Identifier
```

在 Js 中换行符存在特殊的规则，会用来标识自动插入分号规则的；

结构化程序设计需要有三种结构：顺序、分支和循环；
