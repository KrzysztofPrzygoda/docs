# JavaScript Guide

See:
- [Mozilla JS Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS-Tricks JS Snippets](https://css-tricks.com/snippets/javascript/)

## Variables

### Scope

```javascript
function varTest() {
    var x = 1;
    {
        var x = 2;  // same variable!
        console.log(x);  // 2
    }
    console.log(x);  // 2
}

function letTest() {
    let x = 1;
    {
        let x = 2;  // different variable
        console.log(x);  // 2
    }
    console.log(x);  // 1
    }
```

### Check

#### Variable exists
```javascript
if (typeof x !== 'undefined') {
    // x is defined
}
```
#### Object is empty
```javascript
const obj = {};
const isEmpty = Object.keys(obj).length === 0; // true
```

#### Object class name
```javascript
function getClass(obj) {
   // if the type is not an object return the type
   if ((let type = typeof obj) !== 'object') return type; 
   // otherwise, access the class name
   else return obj.constructor.name;   
}
```

### Iterate

See:
- [TypeError: 'x' is not iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/is_not_iterable)

#### Iterate object properties

```javascript
const obj = { France: 'Paris', England: 'London' };

// Iterate over the property names:
for (const country of Object.keys(obj)) {
    const capital = obj[country];
    console.log(country, capital);
}

for (const [country, capital] of Object.entries(obj)) {
    console.log(country, capital);
}
```

#### Iterate map

```javascript
const map = new Map;
map.set('France', 'Paris');
map.set('England', 'London');

// Iterate over the property names:
for (const country of map.keys()) {
    const capital = map.get(country);
    console.log(country, capital);
    }

for (const capital of map.values()) {
    console.log(capital);
}

for (const [country, capital] of map.entries()) {
    console.log(country, capital);
}
```

#### Iterate over a generator

[Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators#generators) are functions you call to produce an iterable object.

```javascript
function* generate(a, b) {
    yield a;
    yield b;
}

for (const x of generate(1, 2)) {
    console.log(x);
}
```

#### Iterate querySelectorAll matches

See:
- [css-tricks.com](https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/)

```javascript
let nodes = document.querySelectorAll('.class');
for (const n of nodes) {
    console.log(n.id);
}
```

Classic loop:
```javascript
let divs = document.querySelectorAll('div'), i;
for (i = 0; i < divs.length; ++i) {
    divs[i].style.color = "green";
}
```

## Conditionals

### if/else/break
If you label the if statement you can use break:
```java
breakme: if (condition) {
    // Do stuff

    if (condition2) {
        // do stuff
    } else {
        break breakme;
    }

    // Do more stuff
}
```
You can even label and break plain blocks:
```javascript
breakme: {
    // Do stuff

    if (condition) {
        // do stuff
    } else {
        break breakme;
    }

    // Do more stuff
}
```
It's not a commonly used pattern though, so might confuse people and possibly won't be optimised by compliers. It might be better to use a function and return, or better arrange the conditions.
```javascript
( function() {
   // Do stuff

   if (condition) {
       // Do stuff 
   } else {
        return;
   }

   // Do other stuff
}() );
```

## Comparistions

### Includes

```javascript
// string.includes(string)
console.log( "this is a test".includes('is') ); // ES6 2015
console.log( 0 <= "this is a test".indexOf('is') ); // Safe

// array.includes(string)
console.log( ['abc','def','ghi'].includes('def') ); // ES7 2016
console.log( 0 <= ['abc','def','ghi'].indexOf('def') ); // Safe

```
