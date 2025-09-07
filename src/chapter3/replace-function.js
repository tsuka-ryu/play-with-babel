import { transform } from "@babel/core";

const source = "function hoge() {return 1}";

const targetId = "hoge";
const replaceCode = "function hoge() {return 2}";

// 作られたものふふ判定するためのシンボル
// マークがついてれば置換処理済み
const WasCreated = Symbol("WasCreated");

const plugin = ({ types: t, template }) => {
  return {
    visitor: {
      FunctionDeclaration: (nodePath, _state) => {
        if (nodePath[WasCreated] || !t.isIdentifier(nodePath.node.id)) {
          return;
        }

        if (nodePath.node.id.name === targetId) {
          const newAst = template(replaceCode)();
          const newNodePath = nodePath.replaceWith(newAst)[0];
          newNodePath[WasCreated] = true;
        }
      },
    },
  };
};

console.log(transform(source, { plugins: [plugin] }).code);
// -> function hoge() {return 2}
