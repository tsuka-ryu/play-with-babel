import { transform } from "@babel/core";
import { plugin as di } from "./babel-plugin-di.js";

const opts = {
  re_opts: {
    "const hoge =": '"const hoge replaced"',
    "function fuga": 'function TempFuga() {console.log("function fuga replaced")}',
    "class Piyo":
      'class TempPiyo {constructor() {console.log("class Piyo replaced")} get() {return "piyo"}}',
    insert: {
      last: "module.exports.Piyo = Piyo",
    },
  },
};

const src = `
const hoge = 'hoge'

console.log(hoge)

function fuga() {
    console.log('fuga')
}

fuga()

class Piyo {

    constructor(){
        console.log('piyo');
    }

    get() {
        return null
    }
}
`;

console.log("before:");
console.log(src);

const { code } = transform(src, {
  plugins: [[di, opts]],
});
console.log("\nafter:");
console.log(code);
