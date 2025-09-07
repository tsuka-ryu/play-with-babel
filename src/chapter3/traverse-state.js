import { transform } from "@babel/core";

const plugin = (_babel) => {
  return {
    pre() {
      this.hoge = "hoge";
    },
    visitor: {
      Program: (nodePath, state) => {
        nodePath.traverse(
          {
            BinaryExpression: (_innerPath, innerState) => {
              console.log(innerState);
            },
          },
          { fuga: "FUGA" }
        );

        console.log(state.constructor.name); // -> PluginPass
        console.log(state.hoge); // -> pre()で設定した値
      },
    },
  };
};

transform("1 + 2", { plugins: [plugin] });
