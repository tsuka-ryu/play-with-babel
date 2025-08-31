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
    // Node型じゃないのでたどらない
    if (!isNode(node[key])) {
      return;
    }

    if (Array.isArray(node[key])) {
      // Node型の配列なのでそれぞれ再帰する
      res[key] = node[key].map((v) => traverser(v, exitVisitor, indent + 2));
    } else {
      res[key] = traverser(node[key], exitVisitor, indent + 2);
    }
  });

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

const results = traverser(parse(code), exitVisitor);
results.forEach((r) => {
  console.log(r);
});

// node src/chapter1/ast-calc.js '1 + 2 * (3 + 4)'
