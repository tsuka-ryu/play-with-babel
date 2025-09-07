import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const { default: traverseDefault } = traverse;

const src = "1 + 2";
const ast = parse(src);

const visitor = {
  enter(nodePath) {
    console.log(`enter: ${nodePath.type}`);
  },
  exit(nodePath) {
    console.log(`exit: ${nodePath.type}`);
  },
  NumericLiteral: {
    enter(nodePath) {
      console.log(`numericLiteral enter: ${nodePath.type}`);
    },
    exit(nodePath) {
      console.log(`numericLiteral exit: ${nodePath.type}`);
    },
  },
  BinaryExpression(nodePath) {
    console.log(`binaryExpression: ${nodePath.type}`);
  },
};

traverseDefault(ast, visitor);

/*
enter: Program
enter: ExpressionStatement
enter: BinaryExpression
binaryExpression: BinaryExpression
enter: NumericLiteral
numericLiteral enter: NumericLiteral
exit: NumericLiteral
numericLiteral exit: NumericLiteral
enter: NumericLiteral
numericLiteral enter: NumericLiteral
exit: NumericLiteral
numericLiteral exit: NumericLiteral
exit: BinaryExpression
exit: ExpressionStatement
exit: Program
*/
