import { parseExpression } from "@babel/parser";

// 作成済みのノードをマークするためのシンボル（無限ループ防止）
const WasCreated = Symbol("WasCreated");

/**
 * Dependency Injection用のBabelプラグイン
 * 変数宣言、関数宣言、クラス宣言の置換とコードの挿入を行う
 */
export const plugin = ({ types: t, template }) => {
  const visitor = {
    // プログラム終了時の処理（exitフェーズで実行）
    Program: {
      exit: (nodePath, state) => {
        // 末尾にコードを挿入
        if (state.inserters.last) {
          const newAst = template(state.inserters.last)();
          nodePath.pushContainer("body", newAst);
        }
      },
    },
    
    // 変数宣言の処理
    VariableDeclarator: (nodePath, state) => {
      const { kind } = nodePath.parent; // const, let, var

      if (t.isIdentifier(nodePath.node.id)) {
        // "const hoge =" のようなパターンでマッチング
        const replaceCode =
          state.replacers[`${kind} ${nodePath.node.id.name} =`];
        if (replaceCode) {
          // 式として解析して初期化部分を置換
          const newAst = parseExpression(replaceCode);
          nodePath.get("init").replaceWith(newAst);
        }
      }
    },
    
    // 関数宣言・クラス宣言の処理
    "FunctionDeclaration|ClassDeclaration": (nodePath, state) => {
      // 既に処理済みまたは識別子でない場合はスキップ
      if (nodePath.node[WasCreated] || !t.isIdentifier(nodePath.node.id)) {
        return;
      }
      
      // タイプに応じてプレフィックスを決定
      const optId = {
        FunctionDeclaration: "function",
        ClassDeclaration: "class",
      };

      const originalName = nodePath.node.id.name;
      // "function fuga" や "class Piyo" のパターンでマッチング
      const replaceCode =
        state.replacers[`${optId[nodePath.type]} ${originalName}`];
      if (replaceCode) {
        // テンプレートから新しいASTを生成
        const newAst = template(replaceCode)();
        const newNodePath = nodePath.replaceWith(newAst)[0];
        // 処理済みマークを付与（無限ループ防止）
        newNodePath.node[WasCreated] = true;
        // 一時的な名前から元の名前に戻す（重複宣言エラー回避のため）
        newNodePath.node.id.name = originalName;
      }
    },
  };
  
  return {
    name: "dependency-injection",
    visitor,
    // プラグイン初期化時の処理
    pre() {
      // オプションからインサーターと置換ルールを取得
      this.inserters = Object.assign({}, this.opts.insert);
      this.replacers = Object.assign({}, this.opts.re_opts);
    },
  };
};
