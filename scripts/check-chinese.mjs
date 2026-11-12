/** 检查应用与共享组件的显示词典覆盖率，并验证转换后的语法。 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { entries, localize } from './chinese-copy.mjs'

const root = resolve(import.meta.dirname, '..')
const catalog = JSON.parse(readFileSync(`${root}/src/i18n/zh-CN.json`, 'utf8'))
const missing = new Map()
let checked = 0

function scan(directory) {
    for (const file of readdirSync(directory, { withFileTypes: true })) {
        const path = `${directory}/${file.name}`
        if (file.isDirectory()) {
            if (file.name !== '__mocks__') scan(path)
            continue
        }
        if (!/\.[cm]?[jt]sx?$/.test(path) || /(?:\.d\.ts|\.(?:test|spec)\.[jt]sx?)$/.test(path)) continue
        const code = readFileSync(path, 'utf8')
        for (const { text } of entries(code, path)) {
            if (!Object.hasOwn(catalog, text)) missing.set(text, path.slice(root.length + 1))
        }
        const transformed = localize(code, path, catalog)
        const kind = path.endsWith('.tsx')
            ? ts.ScriptKind.TSX
            : path.endsWith('.ts')
              ? ts.ScriptKind.TS
              : path.endsWith('.jsx')
                ? ts.ScriptKind.JSX
                : ts.ScriptKind.JS
        const before = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, kind).parseDiagnostics
        const after = ts.createSourceFile(path, transformed, ts.ScriptTarget.Latest, true, kind).parseDiagnostics
        assert.ok(
            after.length <= before.length,
            `${path} 转换后语法异常：${after.map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('; ')}`,
        )
        checked++
    }
}
scan(`${root}/src`)
scan(`${root}/node_modules/@devtron-labs/devtron-fe-common-lib/dist`)
for (const [text, path] of missing) console.error(JSON.stringify({ 文案: text, 文件: path }))
assert.equal(missing.size, 0, '请将新增显示文案补充到 src/i18n/zh-CN.json；专业术语也需明确登记原文')
console.log(`中文词典检查通过：${checked} 个源文件，${Object.keys(catalog).length} 条文案。`)
