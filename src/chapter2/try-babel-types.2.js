import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import t from "@babel/types";

const { default: traverseDefault } = traverse;

const src = "1 + 2";
const ast = parse(src);

traverseDefault(ast, {
  BinaryExpression: (nodePath) => {
    const { left, right, operator } = nodePath.node;
    if (t.isNumericLiteral(left) && t.isNumericLiteral(right)) {
      // biome-ignore lint/security/noGlobalEval: <explanation>
      console.log(eval(`${left.value} ${operator} ${right.value}`)); // -> 3
    }
  },
});
