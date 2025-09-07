import { transform } from "@babel/core";

const optimizePlugin = ({ types: t }) => {
  const toLiterals = {
    string: (value) => t.stringLiteral(value),
    number: (value) => t.numericLiteral(value),
    boolean: (value) => t.booleanLiteral(value),
    null: () => t.nullLiteral(),
  };

  const valueToLiteral = (value) => toLiterals[typeof value](value);

  const evaluateVisitor = {
    exit: (nodePath) => {
      if (t.isImmutable(nodePath.node)) {
        return;
      }

      const { confident, value } = nodePath.evaluate();
      if (confident && typeof value !== "object") {
        nodePath.replaceWith(valueToLiteral(value));
      }
    },
  };

  return {
    visitor: {
      Program: (nodePath) => {
        nodePath.traverse(evaluateVisitor);
      },
    },
  };
};

const source = `
const a = 1 + 2 * 3 / 4
console.log(a)
let b = a + 2
console.log(b)
`;

const { code } = transform(source, { plugins: [optimizePlugin] });
console.log(code);
