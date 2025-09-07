import { transform } from "@babel/core";

const source = "class Hoge {}";

const targetId = "Hoge";
const replaceCode = 'class TempHoge{ hoge() {return "hoge"}}'; // Hogeというクラス名で作成しようとするとエラーになる別名にしておく

const WasCreated = Symbol("WasCreated");

const plugin = ({ types: t, template }) => {
  return {
    visitor: {
      "FunctionDeclaration|ClassDeclaration": (nodePath, _state) => {
        if (nodePath[WasCreated] || !t.isIdentifier(nodePath.node.id)) {
          return;
        }

        if (nodePath.node.id.name === targetId) {
          const newAst = template(replaceCode)();
          const newNodePath = nodePath.replaceWith(newAst)[0];
          newNodePath[WasCreated] = true;
          // Rename TempHoge back to Hoge
          newNodePath.node.id.name = targetId;
        }
      },
    },
  };
};

console.log(transform(source, { plugins: [plugin] }).code);
// -> class Hoge{hoge(){return"hoge"}}
