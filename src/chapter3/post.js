import { transform } from "@babel/core";

const plugin = (_babel) => {
  return {
    pre() {
      this.hoge = "hoge";
    },
    visitor: {
      Program: (_nodePath, state) => {
        state.hoge = "ほげ";
      },
    },
    // traverseした後に実行される
    post() {
      console.log(this.hoge); // ->ほげ
    },
  };
};

transform("1 + 2", { plugins: [plugin] });
