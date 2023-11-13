## Language learning methodology
**In a computer language, as long as there are three kinds of logic,
sequential execution logic, branch logic and loop logic,
the language can reach the Turing-complete state.**

> toy-js will be based on our own custom semantics in the `Language.md`.
>
> You need to have some understanding of the lexical definition of computer language before you can
> understand the program, of course `Language.md` may also help you.

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
