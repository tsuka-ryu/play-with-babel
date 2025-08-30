import { parse } from "@babel/parser";

const ast = parse("1 + 2 * (3 + 4)");

console.log(ast);

/** 結果
Node {
  type: 'File',
  start: 0,
  end: 15,
  loc: SourceLocation {
    start: Position { line: 1, column: 0, index: 0 },
    end: Position { line: 1, column: 15, index: 15 },
    filename: undefined,
    identifierName: undefined
  },
  errors: [],
  program: Node {
    type: 'Program',
    start: 0,
    end: 15,
    loc: SourceLocation {
      start: [Position],
      end: [Position],
      filename: undefined,
      identifierName: undefined
    },
    sourceType: 'script',
    interpreter: null,
    body: [ [Node] ],
    directives: []
  },
  comments: []
} 
*/
