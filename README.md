## Language learning methodology

#### In fact, what I want to express is that the logic behind the language is the same, and we can use any language to achieve everything we want to express in this repo.

**In a computer language, as long as there are three kinds of logic,
sequential execution logic, branch logic and loop logic,
the language can reach the Turing-complete state.**

> toy-js will be based on our own custom semantics in the `Language.md`.
>
> You need to understand the lexical definition of computer language before you can understand the program.
> You can also use `Language.md` to help you get a better understanding based on [MDN - lexical grammar](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Lexical_grammar) grammar.

**Tip:** You should test by adhering to the content of the code block, otherwise unexpected errors will occur.
These bugs are often features that are not currently implemented.
Of course you can try to achieve it.

### what toy-js can do?

you can write the following code in the textarea 
and view the result after execution in the console.


1. logic And(&&)、Or(||):

```js
// and &&
false && 1;
undefined && 1;
"" && 1;
0 && 1;
1 && 0; 

// or ||
3 || 1;
undefined || 1;
// 略...
```

2. declaration of variables、object and functions:

- `var a; a = 1; a;`

3. gets the object property value:

- `o = { num: 1 }; o.num;`

4. four operations:

```js
// +
a = 6;
a = a + 2;
a;

// -
a = 6;
a = a - 2;
a;
// *
a = 6;
a = a * 2;
a;

// /
a = 6;
a = a / 2;
a;
```

5. branch logic
You can use all the false values supported in Js as a condition for if.

```js
a = 1;
if(a) a = 2;
// or
if(a) {
  a = 2;
}
a;
```
6. loop logic
You can use all the false values supported in Js as a condition for while.

```js
a = 10;
while(a)
  a = a - 1;
// or
while(a){
  a = a - 1;
}
// or
while(a){
  a = a - 1;
  continue; // or break;
  a = a - 100;
}
a;
```
7. block scope chain
```js
{
  let a;
  a = 1;
  {
    let b;
    a = a + 1;
    b = 10;
    {
      b =  b / 2;
    }
  }
}
// 此时无法在外部访问 a 和 b

// or
{
  let a;
  a = 1;
  {
    let a;
    a = 100;
  }
  a; // 1
}

```


8.  function declaration and call
```js
// log(); method is equivalent to console.log();
let x;
x = 1;
function a(){
  log(x);
}
{
  let x;
  x = 2;
  a();
}

// or

log(1, 2, 3);
```
