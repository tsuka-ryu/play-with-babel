import { generate } from "@babel/generator";
import t from "@babel/types";

const ast = t.binaryExpression("*", t.numericLiteral(1), t.numericLiteral(2));
const { code } = generate(ast);
console.log(code); // -> 1 * 2
