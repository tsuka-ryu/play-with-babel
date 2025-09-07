import * as prettierPluginEstree from "prettier/plugins/estree";
import prettier from "prettier/standalone";

const rawAst = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Literal", value: 1, raw: "1" },
        right: { type: "Literal", value: 2, raw: "2" },
      },
    },
  ],
};

// カスタムパーサープラグイン
const dummyParserPlugin = {
  parsers: {
    "dummy-ast": {
      parse(_text) {
        return rawAst;
      },
      astFormat: "estree",
    },
  },
};

const code = await prettier.format("dummy", {
  semi: false,
  singleQuote: true,
  parser: "dummy-ast",
  plugins: [dummyParserPlugin, prettierPluginEstree],
});

console.log(code);
// 1 + 2
