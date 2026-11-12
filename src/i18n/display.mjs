/** 仅翻译显示位置中的已知文案，未知文本、资源名称和 React 节点保持原样。 */
import catalog from './zh-CN.json' with { type: 'json' }

/** @template T @param {T} value 显示内容 @returns {T} 本地化后的同类内容 */
export function translateDisplay(value) {
    if (typeof value !== 'string') return value
    const key = value.replace(/\s+/g, ' ').trim()
    return /** @type {T} */ (Object.hasOwn(catalog, key) ? catalog[key] : value)
}
