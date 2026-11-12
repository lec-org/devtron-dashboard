/** 校验中文化边界：只改显示，不改路由、状态比较、用户数据或代码样例。 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import ts from 'typescript'
import { entries, localize } from './chinese-copy.mjs'
import { translateDisplay } from '../src/i18n/display.mjs'

const catalog = {
    Create: '创建',
    Ready: '就绪',
    'Select environment': '选择环境',
    'Login with': '通过以下服务登录：',
    'Use "main" branch': '使用 "main" 分支',
}

test('翻译 JSX 文本、属性、模板片段和组件库编译产物', () => {
    const source =
        'const View = () => <><Button text="Create" title=\'Use "main" branch\' /><span>{`Login with ${provider}`}</span><p>Select environment</p></>'
    const result = localize(source, 'View.tsx', catalog)
    assert.ok(result.includes('text={"创建"}'))
    assert.ok(result.includes('选择环境'))
    assert.ok(result.includes('使用 \\"main\\" 分支'))
    assert.ok(result.includes('通过以下服务登录：'))
    assert.equal(
        ts.createSourceFile('View.tsx', result, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX).parseDiagnostics
            .length,
        0,
    )
    assert.ok(
        localize('jsx(Button, {text: "Create", value: "Ready"})', 'shared.js', catalog).includes(
            'text: "创建", value: "Ready"',
        ),
    )
    assert.ok(localize('jsx("Create", {children: "Create"})', 'shared.js', catalog).includes('jsx("Create",'))
    assert.ok(
        localize('jsx("p", {children: [entry.quote, "!"]})', 'shared.js', catalog).includes(
            '__lecDisplay(entry.quote)',
        ),
    )
})

test('状态值、比较、路由、CSS、资源名称和代码样例保留原值', () => {
    const source = `enum Status { READY = 'Ready' }
        const options = [{label: 'Create', value: 'Create', containerClass: 'flexbox flex-grow-1'}]
        const View = () => <><a href="Create">Create</a><span>{app.name}</span><span>{app.name.toUpperCase()}</span><div className="Create" /><code>Create</code><p>{status === 'Ready' ? label : status}</p></>`
    const result = localize(source, 'View.tsx', catalog)
    for (const original of [
        "READY = 'Ready'",
        "value: 'Create'",
        'href="Create"',
        'className="Create"',
        '<code>Create</code>',
        "status === 'Ready'",
        '{app.name}',
        '{app.name.toUpperCase()}',
    ])
        assert.ok(result.includes(original), original)
    assert.ok(result.includes('label: "创建"'))
    assert.ok(result.includes('__lecDisplay(status'))
    assert.ok(!entries('const x = {containerClass: "flexbox flex-grow-1", d: "M10 20 L30 40"}', 'x.js').length)
    const request = 'post(url, {content: form.text, description: form.description, message: status})'
    assert.equal(localize(request, 'service.ts', catalog), request)
    const resource = 'const View = () => <span>{app.name || fallback}</span>'
    assert.equal(localize(resource, 'View.tsx', catalog), resource)
    const parser = 'parse({type:"literal", text:"value", label:"Create", children:["Create"]})'
    assert.equal(
        localize(parser, '/node_modules/@devtron-labs/devtron-fe-common-lib/dist/parser.js', {
            value: '值',
            Create: '创建',
        }),
        parser,
    )
})

test('动态显示支持变量，未知资源与非文本节点保持原样', () => {
    const result = localize(
        'const View = () => <Button title={labels.CREATE} text={ready ? labels.READY : labels.CREATE} />',
        'View.tsx',
        catalog,
    )
    assert.ok(result.includes('title={__lecDisplay(labels.CREATE)}'))
    assert.ok(result.includes('text={__lecDisplay(ready ? labels.READY : labels.CREATE)}'))
    assert.equal(translateDisplay('Create'), '创建')
    assert.equal(translateDisplay('my-production-app'), 'my-production-app')
    assert.equal(translateDisplay('constructor'), 'constructor')
    const element = { type: 'button', props: {} }
    assert.equal(translateDisplay(element), element)
    assert.ok(
        localize('jsx("span", {children: getThemePreferenceText(theme)})', 'shared.js', catalog).includes(
            '__lecDisplay(getThemePreferenceText(theme))',
        ),
    )
})

test('共享包的独立日期库使用中文相对时间，普通数据对象不变', () => {
    const source =
        'const relative = {future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", d: "a day"}; const data = {value: "a minute"}'
    const result = localize(source, 'shared.js', {
        'in %s': '%s后',
        '%s ago': '%s前',
        'a few seconds': '几秒',
        'a minute': '1分钟',
        'a day': '1天',
    })
    assert.ok(result.includes('future: "%s后"'))
    assert.ok(result.includes('past: "%s前"'))
    assert.ok(result.includes('value: "a minute"'))
})
