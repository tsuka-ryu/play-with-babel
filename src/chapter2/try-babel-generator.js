import { generate } from "@babel/generator";

const ast = {
  type: "ExpressionStatement",
  expression: {
    type: "BinaryExpression",
    operator: "+",
    left: {
      type: "NumericLiteral",
      value: 1,
    },
    right: {
      type: "NumericLiteral",
      value: 2,
    },
  },
};

const { code, _map } = generate(ast);
console.log(code);
// 1 + 2;
