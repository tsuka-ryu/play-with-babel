/**
 * 高度なBabel最適化プラグインの実装例
 * 
 * このプラグインは以下の最適化を実行します：
 * 1. 定数畳み込み (Constant Folding) - 式の値をコンパイル時に計算
 * 2. インライン展開 - 変数参照を定数値に置き換え
 * 3. デッドコード削除 - 未使用の変数宣言を削除
 * 4. 代入式の最適化 - 無駄な代入を変数宣言にマージ
 */
import { transform } from "@babel/core";

const source = `
const a = 1 + 2 * 3 / 4
console.log(a)
let b = a + 2
console.log(b)
`;

// 高度な最適化プラグイン：定数畳み込み + デッドコード削除
const optimizePlugin = ({ types: t }) => {
  // 値をASTリテラルに変換するヘルパー
  const toLiterals = {
    string: (value) => t.stringLiteral(value),
    number: (value) => t.numericLiteral(value),
    boolean: (value) => t.booleanLiteral(value),
    null: () => t.nullLiteral(),
  };

  const valueToLiteral = (value) => toLiterals[typeof value](value);

  // 現在のノードより前の兄弟ノードから、条件に合致するものを検索
  const searchPrevNodes = (nodePath, conditionPaths) => {
    const statement = nodePath.getStatementParent();
    if (!statement) {
      return [];
    }

    // 前の兄弟ノードをフィルタリングして、条件パスに含まれるものを返す
    return statement.getAllPrevSiblings().filter((p) => {
      return (
        conditionPaths.filter((v) => v.node.start === p.node.start).length > 0
      );
    });
  };

  // 評価と最適化を行うビジター
  const evaluateVisitor = {
    // 全てのノードの出口で実行される基本的な定数畳み込み
    exit: (nodePath) => {
      // 不変なノード（リテラルなど）はスキップ
      if (t.isImmutable(nodePath.node)) {
        return;
      }

      // スコープを更新して最新の状態にする
      nodePath.scope.crawl();
      // 式を評価して定数値に変換可能かチェック
      const { confident, value } = nodePath.evaluate();
      if (confident && typeof value !== "object") {
        nodePath.replaceWith(valueToLiteral(value));
      }
    },
    // 変数参照を定数値に置き換える（インライン展開）
    ReferencedIdentifier: (nodePath) => {
      nodePath.scope.crawl();
      const { name } = nodePath.node;
      // スコープ内に該当する変数のバインディングがあるかチェック
      if (name in nodePath.scope.bindings) {
        const binding = nodePath.scope.bindings[name];
        // 参照位置より前で値が変更されていないかチェック
        const violations = searchPrevNodes(
          nodePath,
          binding.constantViolations
        );
        if (violations.length > 0) {
          return; // 値が変更されている場合は最適化しない
        }
        // 初期値を評価して定数値に置き換え可能かチェック
        const { confident, value } = binding.path.get("init").evaluate();
        if (confident) {
          nodePath.replaceWith(valueToLiteral(value));
        }
      }
    },
    // 代入式の最適化：未使用の代入を変数宣言にマージ
    AssignmentExpression: {
      exit: (nodePath) => {
        nodePath.scope.crawl();
        // 左辺が識別子でない場合はスキップ（プロパティアクセスなど）
        if (!nodePath.get("left").isIdentifier()) {
          return;
        }
        const { name } = nodePath.node.left;
        if (!(name in nodePath.scope.bindings)) {
          return;
        }
        const binding = nodePath.scope.bindings[name];
        // 代入より前に変数が参照されている場合はスキップ
        const refs = searchPrevNodes(nodePath, binding.referencePaths);
        if (refs.length > 0) {
          return;
        }
        // 代入演算子に応じて新しい初期値を作成
        const { operator, right } = nodePath.node;
        let init;
        if (operator === "=") {
          init = right; // 単純代入
        } else {
          // 複合代入演算子（+=, -=など）を二項演算に変換
          const left = binding.path.node.init;
          init = t.binaryExpression(operator.slice(0, 1), left, right);
        }
        // 変数宣言の初期値を更新し、代入文を削除
        binding.path.get("init").replaceWith(init);
        nodePath.remove();
      },
    },
  };

  return {
    visitor: {
      // プログラム全体に対して評価ビジターを実行
      Program: (nodePath) => {
        nodePath.traverse(evaluateVisitor);
      },
      // 未使用の変数宣言を削除（デッドコード削除）
      VariableDeclarator: {
        exit: (nodePath) => {
          nodePath.scope.crawl();
          if (nodePath.get("id").isIdentifier()) {
            const { name } = nodePath.node.id;
            if (name in nodePath.scope.bindings) {
              const binding = nodePath.scope.bindings[name];
              // 参照回数が0の変数宣言を削除
              if (binding.references === 0) {
                nodePath.remove();
              }
            }
          }
        },
      },
    },
  };
};

const { code } = transform(source, { plugins: [optimizePlugin] });
console.log(code);
