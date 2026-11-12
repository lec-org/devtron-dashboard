/** 提取显示文案并在构建时替换；协议值、比较条件、路由和用户输入保持原值。 */
import ts from 'typescript'
import { fileURLToPath } from 'node:url'
const displayModule = fileURLToPath(new URL('../src/i18n/display.mjs', import.meta.url))

const textKeys =
    /^(children|label|title|subtitle|subTitle|description|placeholder|message|error|msg|content|tooltip|text|heading|subHeading|header|headerName|navHeading|emptyState|ariaLabel|ariaLabelPrefix|aria-label|aria-description|alt|noOptionsMessage|.*Text|.*Title|.*Description|.*Message|.*Placeholder)$/
const forbiddenKeys =
    /^(.*Class(?:Name)?|class|id|key|value|name|type|path|route|href|src|url|code|command|script|pattern|data-testid|testId|d|viewBox|fill|stroke|transform|style|xmlns|role|filter|fontFamily)$/i
export const normalize = (text) => text.replace(/\s+/g, ' ').trim()
const isCopy = (text) =>
    (/[A-Za-z]{2,}[\s"'‘’“”]+[A-Za-z]|^[A-Z][a-z]+[:.!?]?$/.test(text) ||
        /^(?:active|inactive|failed|running|pending|success|error|warning|enabled|disabled|healthy|degraded|unknown|completed|cancelled|queued|skipped)$/i.test(
            text,
        )) &&
    !/^(?:https?:|data:|[./#]|[A-Z_0-9]+$|["{]\s*"?\w+"?\s*:|[MmLlHhVvCcSsQqTtAaZz]\s*-?\d|<svg)/.test(text) &&
    !/^[\w.-]+@\S+$|(?:@keyframes|@media)\b|;\s*[\w-]+\s*:|\b(?:function|return|export|const)\b[^\n]*[{};]/.test(
        text,
    ) &&
    !/(?:^|\s)(?:dc__|flexbox|\d+px\s|version:|apiVersion:)|\(\?=|\\[wsdb]|^<\/?[a-z]|\b(?:fill|stroke-width|class|style)=/.test(
        text,
    ) &&
    !(!text.includes(' ') && /[-_#]/.test(text))
function keyOf(node) {
    return node?.name?.text ?? node?.name?.getText?.() ?? ''
}
function isComponentProps(object) {
    while (ts.isObjectLiteralExpression(object)) {
        const parent = object.parent
        if (ts.isCallExpression(parent))
            return parent.arguments[1] === object && /\b(?:jsx|jsxs|createElement)\b/.test(parent.expression.getText())
        if (!ts.isPropertyAssignment(parent)) return false
        object = parent.parent
    }
    return false
}

// 共享包内置了独立的日期库，单独覆盖其相对时间输出，避免应用语言设置无法传入。
function isRelativeTimeLiteral(node) {
    const property = node.parent
    if (!ts.isPropertyAssignment(property) || property.initializer !== node) return false
    const object = property.parent
    return (
        ts.isObjectLiteralExpression(object) &&
        ['future', 'past', 's', 'm', 'd'].every((key) => object.properties.some((item) => keyOf(item) === key))
    )
}
function isDisplay(node) {
    for (let ancestor = node.parent, depth = 0; ancestor && depth < 9; ancestor = ancestor.parent, depth++) {
        if (ts.isJsxElement(ancestor) && /^(style|script|pre|code)$/.test(ancestor.openingElement.tagName.getText()))
            return false
        if (
            ts.isCallExpression(ancestor) &&
            ancestor.arguments[0] &&
            ts.isStringLiteral(ancestor.arguments[0]) &&
            /^(style|script|pre|code)$/.test(ancestor.arguments[0].text)
        )
            return false
    }
    if (ts.isJsxText(node)) return true
    if (ts.isJsxExpression(node) && !ts.isJsxAttribute(node.parent)) return true
    let current = node
    for (let depth = 0; current.parent && depth < 12; depth++, current = current.parent) {
        const parent = current.parent
        if (ts.isEnumDeclaration(parent)) return 'constant'
        if (ts.isTypeNode(parent) || ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return false
        if (ts.isBinaryExpression(parent) && /^(===|!==|==|!=|in)$/.test(parent.operatorToken.getText())) return false
        if (ts.isCaseClause(parent) && parent.expression === current) return false
        if (ts.isJsxAttribute(parent)) return textKeys.test(keyOf(parent))
        if (ts.isPropertyAssignment(parent)) {
            if (parent.name === current) return false
            const key = keyOf(parent)
            // 共享包同时包含解析器，普通对象的 text/label 不能视为界面属性。
            if (textKeys.test(key))
                return !node.getSourceFile().fileName.includes('/@devtron-labs/devtron-fe-common-lib/') ||
                    isComponentProps(parent.parent)
                    ? true
                    : 'constant'
            if (forbiddenKeys.test(key)) return false
            return 'constant'
        }
        if (ts.isJsxExpression(parent)) {
            if (ts.isJsxAttribute(parent.parent)) return textKeys.test(keyOf(parent.parent))
            return true
        }
        if (ts.isVariableDeclaration(parent) || ts.isPropertyDeclaration(parent)) return 'constant'
        if (ts.isCallExpression(parent)) {
            const callee = parent.expression
            if (parent.arguments[0] === current && /\b(?:jsx|jsxs|createElement)\b/.test(callee.getText())) return false
            const fn = ts.isIdentifier(callee)
                ? callee.text
                : ts.isPropertyAccessExpression(callee)
                  ? callee.name.text
                  : ''
            if (/(?:toast|showError|setError|setErrorMessage|setTitle|setDescription|alert|confirm)/i.test(fn))
                return true
            if (
                /(?:get|post|put|patch|delete|fetch|request|track|analytics|console|logger|classNames|classnames|new URL|includes|startsWith|endsWith|replace|match|split|join|querySelector)/i.test(
                    fn,
                )
            )
                return false
        }
        if (ts.isSourceFile(parent)) break
    }
    return 'constant'
}
export function entries(code, file) {
    const kind = file.endsWith('.tsx')
        ? ts.ScriptKind.TSX
        : file.endsWith('.ts')
          ? ts.ScriptKind.TS
          : file.endsWith('.jsx')
            ? ts.ScriptKind.JSX
            : ts.ScriptKind.JS
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, kind)
    const result = []
    function visit(node) {
        if (
            ts.isJsxText(node) ||
            ts.isStringLiteral(node) ||
            ts.isNoSubstitutionTemplateLiteral(node) ||
            ts.isTemplateHead(node) ||
            ts.isTemplateMiddle(node) ||
            ts.isTemplateTail(node)
        ) {
            const raw = ts.isJsxText(node) ? node.getText(source) : node.text
            const text = normalize(raw)
            const relativeTime = isRelativeTimeLiteral(node)
            const display = relativeTime || isDisplay(node)
            if ((relativeTime || isCopy(text) || (display === true && /^[a-z]{2,}[.!?:]?$/.test(text))) && display)
                result.push({
                    text,
                    raw,
                    start: node.getStart(source),
                    end: node.end,
                    kind: node.kind,
                    attribute: ts.isJsxAttribute(node.parent),
                    constant: display === 'constant',
                })
        }
        ts.forEachChild(node, visit)
    }
    visit(source)
    return result
}
export function localize(code, file, catalog) {
    const changes = entries(code, file).filter(
        (entry) => !entry.constant && catalog[entry.text] && catalog[entry.text] !== entry.text,
    )
    for (const entry of changes.reverse()) {
        const leading = /^\s*/.exec(entry.raw)[0],
            trailing = /\s*$/.exec(entry.raw)[0]
        const value = leading + catalog[entry.text] + trailing
        let replacement
        if (entry.kind === ts.SyntaxKind.JsxText)
            replacement = value
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('{', '&#123;')
                .replaceAll('}', '&#125;')
        else if (entry.kind === ts.SyntaxKind.TemplateHead)
            replacement = '`' + value.replaceAll('`', '\\`').replaceAll('${', '\\${') + '${'
        else if (entry.kind === ts.SyntaxKind.TemplateMiddle)
            replacement = '}' + value.replaceAll('`', '\\`').replaceAll('${', '\\${') + '${'
        else if (entry.kind === ts.SyntaxKind.TemplateTail)
            replacement = '}' + value.replaceAll('`', '\\`').replaceAll('${', '\\${') + '`'
        else replacement = entry.attribute ? '{' + JSON.stringify(value) + '}' : JSON.stringify(value)
        code = code.slice(0, entry.start) + replacement + code.slice(entry.end)
    }
    return localizeExpressions(code, file)
}

// 动态标签在显示位置翻译；资源名称、版本、地址与代码数据不经过显示词典。
function localizeExpressions(code, file) {
    const kind = file.endsWith('.tsx')
        ? ts.ScriptKind.TSX
        : file.endsWith('.ts')
          ? ts.ScriptKind.TS
          : file.endsWith('.jsx')
            ? ts.ScriptKind.JSX
            : ts.ScriptKind.JS
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, kind)
    const changes = []
    const dataNames =
        /^(?:name|.*Name|username|.*Version|version|.*Id|id|hash|.*Hash|commit|sha|url|.*Url|path|.*Path|namespace|code|script|value|.*Value|children)$/i
    function containsResourceData(node) {
        if (ts.isPropertyAccessExpression(node) && dataNames.test(node.name.text)) return true
        if (ts.isIdentifier(node) && dataNames.test(node.text)) return true
        return !!ts.forEachChild(node, containsResourceData)
    }
    function eligible(node) {
        if (!node) return false
        if (containsResourceData(node)) return false
        if (ts.isIdentifier(node)) return !dataNames.test(node.text)
        if (ts.isPropertyAccessExpression(node)) return !dataNames.test(node.name.text)
        if (ts.isElementAccessExpression(node)) return true
        if (ts.isTemplateExpression(node)) return true
        if (ts.isConditionalExpression(node) || ts.isBinaryExpression(node)) return true
        if (ts.isCallExpression(node)) {
            if (ts.isPropertyAccessExpression(node.expression)) return eligible(node.expression.expression)
            return (
                !dataNames.test(node.expression.getText()) &&
                !/(?:Name|Version|Id|Hash|URL|Path)$/.test(node.expression.getText())
            )
        }
        return false
    }
    function add(node) {
        if (ts.isArrayLiteralExpression(node)) {
            node.elements.forEach(add)
            return
        }
        if (eligible(node))
            changes.push({
                start: node.getStart(source),
                end: node.end,
                value: `__lecDisplay(${node.getText(source)})`,
            })
    }
    function visit(node) {
        if (ts.isJsxExpression(node) && node.expression) {
            if (ts.isJsxAttribute(node.parent)) {
                if (textKeys.test(keyOf(node.parent))) add(node.expression)
            } else if (isDisplay(node)) add(node.expression)
        }
        if (ts.isPropertyAssignment(node) && textKeys.test(keyOf(node)) && isComponentProps(node.parent))
            add(node.initializer)
        ts.forEachChild(node, visit)
    }
    visit(source)
    if (!changes.length) return code
    // 父级显示表达式已经覆盖子表达式，避免对同一段源码重复插入。
    const outer = changes.filter(
        (change) =>
            !changes.some((other) => other !== change && other.start <= change.start && other.end >= change.end),
    )
    for (const change of outer.sort((a, b) => b.start - a.start))
        code = code.slice(0, change.start) + change.value + code.slice(change.end)
    return `import { translateDisplay as __lecDisplay } from ${JSON.stringify(displayModule)};\n` + code
}
