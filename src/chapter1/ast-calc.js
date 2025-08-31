import { parse } from "@babel/parser";

const code = process.argv.slice(2).join(" ");

const isNode = (obj) => {
  // NodeもしくはNodeの配列は必ずobject型
  if (typeof obj !== "object") {
    return false;
  }

  // 配列の中にNodeが含まれていれば、配列自体をNode型と判定する
  if (Array.isArray(obj)) {
    return obj.find((v) => isNode(v) !== undefined);
  }

  return obj && "constructor" in obj && obj.constructor.name === "Node";
};

// そのNodeに対応ソースコードをーを取得するヘルパー関数
const getCode = (node) => code.substring(node.start, node.end);

const traverser = (node, exitVisitor, indent = 0) => {
  console.log(`${" ".repeat(indent)}enter:${node.type} '${getCode(node)}'`);
  if (!(node.type in exitVisitor)) {
    console.error(`unknown type ${node.type}`);
    console.log(JSON.stringify(node, null, " "));
    process.exit(1);
  }

  const res = {};
  // Nodeの中身を舐める
  Object.keys(node).forEach((key) => {
    // Node型じゃないのでたどらない = traverseに関係のないkeyを無視する
    if (!isNode(node[key])) {
      return;
    }

    if (Array.isArray(node[key])) {
      // Node型の配列なのでそれぞれ再帰する
      // 今回のコードだと、program.bodyだけは配列なのでここの分岐に入ってくる
      res[key] = node[key].map((v) => traverser(v, exitVisitor, indent + 2));
    } else {
      res[key] = traverser(node[key], exitVisitor, indent + 2);
    }
  });

  // 再帰なので内側から計算される
  // console.log(res);
  console.log(`${" ".repeat(indent)}exit:${node.type} '${getCode(node)}'`);
  // ビジター関数を呼び出してその結果を返す
  return exitVisitor[node.type](node, res, indent);
};

export const exitVisitor = {
  File: (_node, res) => res.program,

  Program: (_node, res) => res.body,

  ExpressionStatement: (node, res) => {
    const _expr = node.expression;
    return `${getCode(node)} = ${res.expression}`;
  },

  BinaryExpression: (node, res, indent) => {
    console.log(
      `${" ".repeat(indent)} ${res.left} ${node.operator} ${res.right}`
    );
    const { left, right } = res;
    switch (node.operator) {
      case "+":
        return left + right;
      case "*":
        return left * right;
      case "-":
        return left - right;
      case "/":
        return left / right;
      case "%":
        return left % right;
      default:
        throw new Error("対応してない二項演算子");
    }
  },

  NumericLiteral: (node, _res, indent) => {
    console.log(`${" ".repeat(indent)} value: ${node.value}`);
    return node.value;
  },
};

console.log(JSON.stringify(parse(code), null, " "));
const results = traverser(parse(code), exitVisitor);
results.forEach((r) => {
  console.log(r);
});

// node src/chapter1/ast-calc.js '1 + 2 * (3 + 4)'
/*
{
 "type": "File",
 "start": 0,
 "end": 15,
 "loc": {
  "start": {
   "line": 1,
   "column": 0,
   "index": 0
  },
  "end": {
   "line": 1,
   "column": 15,
   "index": 15
  }
 },
 "errors": [],
 "program": {
  "type": "Program",
  "start": 0,
  "end": 15,
  "loc": {
   "start": {
    "line": 1,
    "column": 0,
    "index": 0
   },
   "end": {
    "line": 1,
    "column": 15,
    "index": 15
   }
  },
  "sourceType": "script",
  "interpreter": null,
  "body": [
   {
    "type": "ExpressionStatement",
    "start": 0,
    "end": 15,
    "loc": {
     "start": {
      "line": 1,
      "column": 0,
      "index": 0
     },
     "end": {
      "line": 1,
      "column": 15,
      "index": 15
     }
    },
    "expression": {
     "type": "BinaryExpression",
     "start": 0,
     "end": 15,
     "loc": {
      "start": {
       "line": 1,
       "column": 0,
       "index": 0
      },
      "end": {
       "line": 1,
       "column": 15,
       "index": 15
      }
     },
     "left": {
      "type": "NumericLiteral",
      "start": 0,
      "end": 1,
      "loc": {
       "start": {
        "line": 1,
        "column": 0,
        "index": 0
       },
       "end": {
        "line": 1,
        "column": 1,
        "index": 1
       }
      },
      "extra": {
       "rawValue": 1,
       "raw": "1"
      },
      "value": 1
     },
     "operator": "+",
     "right": {
      "type": "BinaryExpression",
      "start": 4,
      "end": 15,
      "loc": {
       "start": {
        "line": 1,
        "column": 4,
        "index": 4
       },
       "end": {
        "line": 1,
        "column": 15,
        "index": 15
       }
      },
      "left": {
       "type": "NumericLiteral",
       "start": 4,
       "end": 5,
       "loc": {
        "start": {
         "line": 1,
         "column": 4,
         "index": 4
        },
        "end": {
         "line": 1,
         "column": 5,
         "index": 5
        }
       },
       "extra": {
        "rawValue": 2,
        "raw": "2"
       },
       "value": 2
      },
      "operator": "*",
      "right": {
       "type": "BinaryExpression",
       "start": 9,
       "end": 14,
       "loc": {
        "start": {
         "line": 1,
         "column": 9,
         "index": 9
        },
        "end": {
         "line": 1,
         "column": 14,
         "index": 14
        }
       },
       "left": {
        "type": "NumericLiteral",
        "start": 9,
        "end": 10,
        "loc": {
         "start": {
          "line": 1,
          "column": 9,
          "index": 9
         },
         "end": {
          "line": 1,
          "column": 10,
          "index": 10
         }
        },
        "extra": {
         "rawValue": 3,
         "raw": "3"
        },
        "value": 3
       },
       "operator": "+",
       "right": {
        "type": "NumericLiteral",
        "start": 13,
        "end": 14,
        "loc": {
         "start": {
          "line": 1,
          "column": 13,
          "index": 13
         },
         "end": {
          "line": 1,
          "column": 14,
          "index": 14
         }
        },
        "extra": {
         "rawValue": 4,
         "raw": "4"
        },
        "value": 4
       },
       "extra": {
        "parenthesized": true,
        "parenStart": 8
       }
      }
     }
    }
   }
  ],
  "directives": []
 },
 "comments": []
}
*/
/*
enter:File '1 + 2 * (3 + 4)'
  enter:Program '1 + 2 * (3 + 4)'
    enter:ExpressionStatement '1 + 2 * (3 + 4)'
      enter:BinaryExpression '1 + 2 * (3 + 4)'
        enter:NumericLiteral '1'
        exit:NumericLiteral '1'
         value: 1
        enter:BinaryExpression '2 * (3 + 4)'
          enter:NumericLiteral '2'
          exit:NumericLiteral '2'
           value: 2
          enter:BinaryExpression '3 + 4'
            enter:NumericLiteral '3'
            exit:NumericLiteral '3'
             value: 3
            enter:NumericLiteral '4'
            exit:NumericLiteral '4'
             value: 4
          exit:BinaryExpression '3 + 4'
           3 + 4
        exit:BinaryExpression '2 * (3 + 4)'
         2 * 7
      exit:BinaryExpression '1 + 2 * (3 + 4)'
       1 + 14
    exit:ExpressionStatement '1 + 2 * (3 + 4)'
  exit:Program '1 + 2 * (3 + 4)'
exit:File '1 + 2 * (3 + 4)'
1 + 2 * (3 + 4) = 15
*/
