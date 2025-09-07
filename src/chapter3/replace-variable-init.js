import { transform } from "@babel/core";
import { parseExpression } from "@babel/parser";

const source = 'const hoge = require("hoge")';

const targetId = "hoge";
const replaceCode = 'require("dummy-hoge")';

const plugin = ({ types: t, _template }) => {
  return {
    visitor: {
      VariableDeclarator: (nodePath, _state) => {
        if (
          t.isIdentifier(nodePath.node.id) &&
          nodePath.node.id.name === targetId
        ) {
          const newAst = parseExpression(replaceCode);
          nodePath.get("init").replaceWith(newAst);
        }
      },
    },
  };
};

console.log(transform(source, { plugins: [plugin] }).code);
// -> const hoge = require("dummy-hoge");
