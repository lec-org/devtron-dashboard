/** 为本应用及开源共享组件应用同一份中文文案；开发与正式构建使用相同规则。 */
import { readFileSync } from 'node:fs'
import { localize } from './chinese-copy.mjs'
const catalog = JSON.parse(readFileSync(new URL('../src/i18n/zh-CN.json', import.meta.url), 'utf8'))
export default function chineseCopy() {
    return {
        name: 'lec-chinese-copy',
        enforce: 'pre',
        transform(code, id) {
            const path = id.split('?')[0]
            if (!/\.[cm]?[jt]sx?$/.test(path) || path.endsWith('.d.ts')) return null
            if (!path.includes('/src/') && !path.includes('/@devtron-labs/devtron-fe-common-lib/')) return null
            if (path.includes('/node_modules/') && !path.includes('/@devtron-labs/devtron-fe-common-lib/')) return null
            const result = localize(code, path, catalog)
            return result === code ? null : { code: result, map: null }
        },
    }
}
