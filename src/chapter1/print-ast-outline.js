import { parse } from "@babel/parser";

const ast = parse("1 + 2 * (3 + 4)");

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

const replacer = (key, value) => {
  if (!key || key === "type" || isNode(value)) {
    return value;
  }

  return undefined;
};

console.log(JSON.stringify(ast, replacer, " "));

/*
{
 "type": "File",
 "program": {
  "type": "Program",
  "body": [
   {
    "type": "ExpressionStatement",
    "expression": {
     "type": "BinaryExpression",
     "left": {
      "type": "NumericLiteral"
     },
     "right": {
      "type": "BinaryExpression",
      "left": {
       "type": "NumericLiteral"
      },
      "right": {
       "type": "BinaryExpression",
       "left": {
        "type": "NumericLiteral"
       },
       "right": {
        "type": "NumericLiteral"
       }
      }
     }
    }
   }
  ]
 }
}
*/
