import { transform } from "@babel/core";
import syntaxTypescript from "@babel/plugin-syntax-typescript";

const plugin = (_babel) => {
  return {
    // syntax-typescriptプラグインを継承してTypeScript構文を解析可能にする
    inherits: syntaxTypescript.default,
    visitor: {
      VariableDeclarator: (nodePath) => {
        if (nodePath.node.id?.typeAnnotation) {
          console.log(nodePath.node.id.typeAnnotation.type); // -> TSTypeAnnotation
        }
      },
    },
  };
};

transform("let hoge: Hoge", {
  plugins: [plugin],
});
