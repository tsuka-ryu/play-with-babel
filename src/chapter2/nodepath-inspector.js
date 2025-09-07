import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const { default: traverseDefault } = traverse;

const src = "const a = 1;hoge(a)";

const ast = parse(src);

const inspectProps = (prop) => {
  const propType = typeof prop;

  if (propType === "string") {
    return `"${prop}"`;
  } else if (propType !== "object" || !prop) {
    return prop;
  } else if (prop.constructor.name === "Object") {
    return JSON.stringify(prop);
  } else if (prop.constructor.name === "Array") {
    return `[${prop.map((value) => inspectProps(value)).join(" ,")}]`;
  } else {
    if ("type" in prop) {
      return `Object(${prop.constructor.name}) ${prop.type}`;
    } else {
      return `Object(${prop.constructor.name})`;
    }
  }
};

const visitor = {
  // enter(nodePath) {
  // ひとまずCallExpressionだけ見てますが、enterとかを指定してみてもいいでしょう。
  CallExpression(nodePath) {
    console.log(`enter ${nodePath.type}`);
    Object.keys(nodePath)
      .sort()
      .forEach((key) => {
        console.log(` ${key}: ${inspectProps(nodePath[key])}`);
      });
  },
};

traverseDefault(ast, visitor);

/*
enter CallExpression
 _store: null
 _traverseFlags: 0
 container: Object(Node) ExpressionStatement
 context: Object(TraversalContext)
 contexts: [Object(TraversalContext)]
 data: null
 hub: undefined
 key: "expression"
 listKey: undefined
 node: Object(Node) CallExpression
 opts: {"CallExpression":{"enter":[null]},"_exploded":true,"_verified":true}
 parent: Object(Node) ExpressionStatement
 parentPath: Object(NodePath) ExpressionStatement
 scope: Object(Scope)
 skipKeys: null
 state: undefined
 type: "CallExpression"
 */
