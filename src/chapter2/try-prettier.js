import { transform } from "@babel/core";
import * as prettierPluginEstree from "prettier/plugins/estree";
import prettier from "prettier/standalone";

const src = 'console.log("hoge");';

// カスタムパーサープラグイン
const babelParserPlugin = {
  parsers: {
    "babel-custom": {
      parse(text) {
        const result = transform(text, {
          ast: true,
          code: false,
          plugins: [],
        });
        return result.ast;
      },
      astFormat: "estree",
    },
  },
};

const formatted = await prettier.format(src, {
  semi: false,
  singleQuote: true,
  parser: "babel-custom",
  plugins: [babelParserPlugin, prettierPluginEstree],
});

console.log(formatted);
