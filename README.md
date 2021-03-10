# HTMF

HTMF (Hypertext Markup Function) is a method for constructing HTML or DOM trees using native javascript. It looks something like this:

```javascript
import { toString } from 'htmf';

toString($ => { $
  .a('html')
    .b('head')
    .b('body')
      .c('h1').text('Hello World')
      .c('span').text('HTMF can express:')
      .c('ul')
        .d('li .first').text('classes')
        .d('li #second').text('ids')
        .d('li')
          .e('a', {href: 'google.com'}).text('and attributes')
})
```
which creates
```html
<html>
  <head></head>
  <body>
    <h1>Hello World</h1>
    <span>HTMF can express:</span>
    <ul>
      <li class="first">classes</li>
      <li id="second">ids</li>
      <li>
        <a href="google.com">and attributes</a>
      </li>
    </ul>
  </body>
</html>

```
HTMF has different implementations for different frameworks and environments:

|Framework|Module|
|---|---|
| Vue | [brue](https://www.npmjs.com/package/brue) |
| React | [htmf-react](https://www.npmjs.com/package/htmf-react) |


This module is intended to be used as a starting step for an implentation that will add features and/or tie into a framework.

## How it works

HTMF accepts a function that it will pass a "builder" (``$``). The builder has the functions ``a`` through ``z`` which can be used to create a node. The node's place in the tree is expressed by the letter used. ``b`` nodes are children of the last ``a`` node, etc. This is made more clear by properly indenting the nodes. Every builder method returns itself, which allows the chaining of calls.

Nodes accept any number of arguments, and string arguments separated by spaces are treated as separate arguments:

- Strings with no prefix indicate the element type
- Strings with ``.`` prefix indicate a class
- Strings with ``#`` prefix indicate the id
- Objects that are not the first argument indicate attributes

And in special cases:
- Functions indicate the element type (imagine a component class in React)
- Objects placed as the first argument indicate the element type (a Vue component for instance)

So the following two builds are equivalent:
```javascript
$.a('div')
  .b('div .someclass .green #id', {onclick: 'script', title: 'tooltip'})
```
```javascript
$.a('div')
  .b('div', '.someclass','.green','#id', {onclick: 'script'}, {title: 'tooltip'})
```
which creates:
```html
<div>
  <div class="someclass green" id="id" onclick="script" title="tooltip"></div>
</div>
```
### Node modifiers

Node modifers are other functions of the builder besides ``a`` through ``z``. They will always modify the last designated node. The core HTMF module only has the ``.text()`` node modifier. 

### Text nodes

Expressing text nodes (no element) can be done in a number of ways:
```javascript
$.a('div').text('some text')
$.a('div')
  .b().text('some text')
$.a('div')
  .b(String, 'some text')
```
All equivalent. As you can see, passing the global String constructor as the first argument of a node will break from the normal parsing of node arguments and create a text node using the second argument.

### Single node shorthand

Passing an array instead of a function to an HTMF implementation is an easy way to create a single node. The second argument can be used to add a text node:

```javascript
Mf.toString(['a .someclass',{href: 'google.com'}], 'A link to google')
```
will create ``<a href="google.com">A link to google</a>``

## Api

### .process(buildFunction, nodeModifiersObject:optional, ...furtherArgs)

HTMF.process() is intended to be used by other HTMF implementations. It returns an array of the root nodes of a tree created by the buildFunction. Any futher arguments will be passed to the build function, An example of the node structure:

```javascript
{
  element: 'div',
  classes: ['link','green'],
  attributes: {id: 'greenlink'},
  children: []
}
//or a text node:
{
  element: null,
  classes: [],
  attributes: {},
  children: [],
  text: 'some text'
}
```
An example showing a node modifiers object:
```javascript
import { process } from HTMF;

const api = {
  click: (node, func) => {
    node.attributes.onClick = func;
  },
  hide: node => {
    node.attributes.style = "display: none;"
  }
}
const roots = process($ => { $
  $.a('div')
    .b('div .hidden').hide()
    .b('div .button').click(() => { console.log('clicked!') }) 
}, api);
```

### .toString(buildFunction) 

A simple implenetation of HTMF using .process(). It returns an html string created with the buildFunction.




