const code = "1 + 2 * (3 + 4)";

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
const getCode = (node) => code.substr(node.start, node.end - node.start);

const _traverser = (node, exitVisitor, indent = 0) => {
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
      res[key] = node[key].map((v) => _traverser(v, exitVisitor, indent + 2));
    } else {
      res[key] = _traverser(node[key], exitVisitor, indent + 2);
    }
  });

  console.log(`${" ".repeat(indent)}exit:${node.type} '${getCode(node)}'`);
  // ビジター関数を呼び出してその結果を返す
  return exitVisitor[node.type](node, res, indent);
};
