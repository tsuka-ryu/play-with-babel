import { transform } from "@babel/core";

const plugin = (_babel) => {
  return {
    // traverseする前に実行される
    pre() {
      console.log("pre", this.constructor.name); // pre PluginPass
      this.hoge = "hoge";
    },
    visitor: {
      Program: (_nodePath, state) => {
        console.log(state.constructor.name); // -> PluginPass
        console.log(state.hoge); // -> hoge
      },
    },
  };
};

transform("1 + 2", { plugins: [plugin] });
