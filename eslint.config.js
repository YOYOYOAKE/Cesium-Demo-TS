import globals from 'globals' // 常见的全局变量的库，如window、document等
import pluginJs from '@eslint/js' // ESLint 官方提供的 JavaScript 规则插件
import tseslint from 'typescript-eslint' //TypeScript ESLint 插件，允许解析和检查 TypeScript 代码
import pluginVue from 'eslint-plugin-vue' // Vue.js 的 ESLint 插件，用于解析和检查 Vue 文件

import { readFile } from 'node:fs/promises'

const autoImportFile = new URL('./.eslintrc-auto-import.json', import.meta.url)
const autoImportGlobals = JSON.parse(await readFile(autoImportFile, 'utf8'))

export default [
  // 指定 ESLint 检查的文件类型，包括 JS、MJS、CJS、TS 和 Vue 文件
  { files: ['*/*.{js,mjs,cjs,ts,vue}'] },

  // 为浏览器环境设置全局变量选项，允许代码中使用这些全局变量而不会触发 ESLint 警告
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...autoImportGlobals.globals,
      },
      // 使用最新的ECMAScript语法
      ecmaVersion: 12,
      // 代码是ECMAScript模块
      sourceType: 'module',
    },
  },

  // 使用 ESLint 官方推荐的 JavaScript 规则配置
  pluginJs.configs.recommended,

  // 使用 TypeScript ESLint 推荐的规则配置
  ...tseslint.configs.recommended,

  // 使用 Vue.js 插件提供的基本规则配置
  ...pluginVue.configs['flat/essential'],

  // 针对 Vue 文件做特殊配置
  {
    files: ['**/*.vue'],
    // 指定 TypeScript ESLint 解析器来解析 Vue 文件中的 `<script>` 块
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },

  // 自定义规则
  {
    rules: {
      indent: ['error', 2], // 缩进使用 2 个空格
      'linebreak-style': ['error', 'unix'], // 使用 Unix 风格的换行符
      quotes: ['error', 'single'], // 使用单引号
      semi: ['error', 'never'], // 语句末尾不加分号
    },
  },
]
