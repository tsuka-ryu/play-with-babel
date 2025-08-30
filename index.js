import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
const traverseDefault = traverse.default || traverse;
import * as t from '@babel/types';

const code = `
function hello(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}

const greet = (user) => {
  hello(user);
};

class Person {
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    hello(this.name);
  }
}
`;

console.log('=== Original Code ===');
console.log(code);

const ast = parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

console.log('\n=== AST Analysis ===');

traverseDefault(ast, {
  FunctionDeclaration(path) {
    console.log(`Function declaration found: ${path.node.id.name}`);
  },
  
  ArrowFunctionExpression(path) {
    console.log('Arrow function found');
  },
  
  CallExpression(path) {
    if (t.isIdentifier(path.node.callee)) {
      console.log(`Function call: ${path.node.callee.name}`);
    }
  },
  
  ClassDeclaration(path) {
    console.log(`Class declaration found: ${path.node.id.name}`);
  },
  
  VariableDeclarator(path) {
    if (t.isIdentifier(path.node.id)) {
      console.log(`Variable declaration: ${path.node.id.name}`);
    }
  }
});

console.log('\n=== AST Structure (simplified) ===');
console.log(JSON.stringify(ast, (key, value) => {
  if (key === 'loc' || key === 'start' || key === 'end') {
    return undefined;
  }
  return value;
}, 2));