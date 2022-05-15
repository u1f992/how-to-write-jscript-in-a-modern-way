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
npm install --save-dev @babel/core @babel/preset-env @rollup/plugin-babel @rollup/plugin-commonjs @rollup/plugin-typescript rollup tslib typescript
npm install core-js
npx tsc --init
```

### Edit package.json

Even though it is not available in IE8, Rollup tries to use `Object.defineProperty` before the polyfill is applied, I gave up and decided to combine the minimum polyfill at the beginning of the bundled result.

```json
{
    // omit
    "scripts": {
        // omit
        "build": "ECHO Object.defineProperty=function(o,p,d){o[p]=d.value}; > _.js && rollup -c && COPY /B _.js+dist\\index.js _.js && MOVE _.js dist\\index.js"
    }
    // omit
}
```

The entity of `npm run build` is a minified batch file, and detail is below. Since JScript runs only on Windows, there is no need to consider the portability of this script.

```bat
REM Create a temporary file containing only one polyfill.
ECHO Object.defineProperty=function(o,p,d){o[p]=d.value}; > _.js

REM Rollup creates dist\index.js.
rollup -c

REM Concatenate the temporary file and index.js, overwriting the temporary file.
COPY /B _.js+dist\\index.js _.js

REM Overwrite index.js with a temporary file.
MOVE _.js dist\\index.js
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

### Edit rollup.config.js

```js
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

export default [
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.js",
            format: 'es'
        },
        plugins: [
            // Transpile *.ts
            typescript(),

            // Transpile to ES3
            babel({
                babelHelpers: 'bundled',
                extensions: ['.js', '.ts'],
            }),

            // Process CommonJS modules provided by core-js.
            commonjs()
        ]
    }
];
```

### Edit .babelrc

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
