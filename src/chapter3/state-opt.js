import { transform } from "@babel/core";

// PluginPassはBabelプラグインの実行状態を管理するオブジェクト
// - state.optsでプラグインに渡されたオプションにアクセス可能
// - プラグインのライフサイクル全体を通じて状態を保持
const plugin = (_babel) => {
  return {
    visitor: {
      Program: (_nodePath, state) => {
        // state.optsにプラグインオプションが格納される
        console.log(state.opts); // -> {hoge: 'hoge'}
        console.log(state.constructor.name); // -> PluginPass
      },
    },
  };
};

// プラグインにオプションを渡す場合: [プラグイン, オプションオブジェクト] の配列形式
transform("1 + 2", { plugins: [[plugin, { hoge: "hoge" }]] });
