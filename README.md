# How to write JScript in a modern way

- JScript written in TypeScript, transpiled by Babel
- ES modules support by Rollup

## From scratch

### Install dependencies

```ps1
mkdir hoge
cd hoge
mkdir src
mkdir dist
New-Item -Type File src/index.ts # Entry point
New-Item -Type File rollup.config.js
New-Item -Type File .babelrc

npm init --yes
npm install --save-dev @babel/core @babel/preset-env @rollup/plugin-babel @rollup/plugin-typescript rollup tslib typescript
npx tsc --init
```

### Edit tsconfig.json

- Change "module" from "commonjs" to "esnext".
- Add "include" at the same level as "compilerOptions".

```json
{
    "compilerOptions" {
        // omit
        "module": "esnext",  
        // omit
    },
    "include": ["src/**/*.ts"]
}
```

### Add rollup.config.js

```js
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";

export default [
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.js",
            format: 'es'
        },
        plugins: [
            // Transpile *.ts to *.js
            typescript(),

            // Transpile to ES3
            babel({
                babelHelpers: 'bundled',
                extensions: ['.js', '.ts'],
            })
        ]
    }
];
```

### Add .babelrc

```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                // Let Rollup bundle modules up
                "modules": false,

                // Transpile to ES3 without Object.defineProperties
                "targets": {
                    "ie": 8
                },
                "loose": true,

                // Add polyfills automatically
                "useBuiltIns": "usage",
                "corejs": 3
            }
        ]
    ]
}
```

## Tips

### Download .gitignore for Node.js project

```ps1
curl https://github.com/github/gitignore/raw/main/Node.gitignore -Lo .gitignore
```

### 日本語について

JScriptは`ASCII`か`Shift_JIS`、`UTF-16 LE`あたりしか正常に読まないので、日本語を表示する場合にはUTF-8から文字コードを変換するプラグインが必要。Rollupでは[rollup-plugin-convert-encoding](https://www.npmjs.com/package/rollup-plugin-convert-encoding)や[rollup-plugin-encoding](https://www.npmjs.com/package/rollup-plugin-encoding)が該当するが、どちらもメンテナンスされてなさそう。

ところが実際には、なぜかUnicodeエスケープシーケンスに変換されるので支障はない。

```
ふが => \u3075\u304C
```

どこの段階で変換されているのだろう... 助かるけども
