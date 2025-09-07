import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const { default: traverseDefault } = traverse;

const ast = parse("1 + 2");

const visitor = {
  BinaryExpression: (nodePath) => {
    console.log(nodePath.node); // -> Node {...}
  },
};

traverseDefault(ast, visitor);
