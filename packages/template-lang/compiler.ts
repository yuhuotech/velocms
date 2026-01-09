export interface VTCompileOptions {
  themePath?: string
  functions?: Record<string, Function>
  filters?: Record<string, Function>
}

export interface VTNode {
  type: string
  content?: string
  children?: VTNode[]
  attributes?: Record<string, any>
  name?: string
  value?: string
  test?: string
  item?: string
  index?: string
  in?: string
  src?: string
}

export interface CompileResult {
  code: string
  warnings: string[]
}

export class VTCompiler {
  private functions: Record<string, Function> = {}
  private filters: Record<string, Function> = {}
  private themePath: string = ''

  constructor(options: VTCompileOptions = {}) {
    this.themePath = options.themePath || ''
    this.functions = options.functions || {}
    this.filters = options.filters || this.getDefaultFilters()
  }

  private getDefaultFilters(): Record<string, Function> {
    return {
      date: (value: any, format?: string) => {
        if (!value) return ''
        const date = new Date(value)
        if (format === 'short') {
          return date.toLocaleDateString()
        }
        if (format === 'long') {
          return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        }
        return date.toISOString().split('T')[0]
      },
      truncate: (value: string, length: number = 100) => {
        if (!value) return ''
        return value.length > length ? value.substring(0, length) + '...' : value
      },
      escape: (value: string) => {
        if (!value) return ''
        return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      },
      uppercase: (value: string) => value?.toUpperCase() || '',
      lowercase: (value: string) => value?.toLowerCase() || '',
      capitalize: (value: string) => value?.charAt(0).toUpperCase() + value?.slice(1) || '',
      json: (value: any) => JSON.stringify(value),
      length: (value: any) => Array.isArray(value) ? value.length : String(value).length,
      default: (value: any, defaultValue: any) => value ?? defaultValue,
    }
  }

  registerFunction(name: string, fn: Function): void {
    this.functions[name] = fn
  }

  registerFilter(name: string, fn: Function): void {
    this.filters[name] = fn
  }

  compile(template: string, options: VTCompileOptions = {}): string {
    const themePath = options.themePath || this.themePath
    const functions = { ...this.functions, ...options.functions }
    const filters = { ...this.filters, ...options.filters }

    // Parse template into AST
    const ast = this.parse(template)

    // Generate code from AST
    const code = this.generate(ast, { themePath, functions, filters })

    return code
  }

  private parse(template: string): VTNode[] {
    const nodes: VTNode[] = []
    let i = 0

    while (i < template.length) {
      // Check for VT tags
      if (template.substring(i).startsWith('<vt:')) {
        const tagMatch = this.matchTag(template, i)
        if (tagMatch) {
          nodes.push(tagMatch.node)
          i = tagMatch.end
          continue
        }
      }

      // Check for VT expressions {{ }}
      const exprMatch = this.matchExpression(template, i)
      if (exprMatch) {
        nodes.push(exprMatch.node)
        i = exprMatch.end
        continue
      }

      // Regular text
      const textMatch = this.matchText(template, i)
      if (textMatch) {
        nodes.push({
          type: 'text',
          content: textMatch.content,
        })
        i = textMatch.end
      }
    }

    return nodes
  }

  private matchTag(template: string, start: number): { node: VTNode; end: number } | null {
    const tagStart = '<vt:'
    const tagEnd = '</vt:'
    const selfClose = '/>'

    let i = start + tagStart.length
    const tagNameEnd = template.indexOf('>', i)
    if (tagNameEnd === -1) return null

    const tagContent = template.substring(i, tagNameEnd).trim()
    const tagName = tagContent.split(' ')[0]

    // Check if self-closing
    if (tagContent.endsWith(selfClose)) {
      const node: VTNode = { type: 'vt-tag', name: tagName, attributes: this.parseAttributes(tagContent) }
      return { node, end: tagNameEnd + 1 }
    }

    // Find closing tag
    const closeTag = `</vt:${tagName}>`
    const closeIndex = template.indexOf(closeTag, tagNameEnd)

    if (closeIndex === -1) return null

    const innerContent = template.substring(tagNameEnd + 1, closeIndex)
    const attributes = this.parseAttributes(tagContent)

    // Parse children
    const children = this.parse(innerContent)

    const node: VTNode = {
      type: 'vt-tag',
      name: tagName,
      attributes,
      children,
    }

    return { node, end: closeIndex + closeTag.length }
  }

  private matchExpression(template: string, start: number): { node: VTNode; end: number } | null {
    if (template.substring(start).startsWith('{{') && !template.substring(start).startsWith('{{{')) {
      const endIndex = template.indexOf('}}', start + 2)
      if (endIndex === -1) return null

      const content = template.substring(start + 2, endIndex).trim()
      const node: VTNode = {
        type: 'expression',
        content,
      }

      return { node, end: endIndex + 2 }
    }

    // Handle triple braces {{{ }}} for raw output
    if (template.substring(start).startsWith('{{{')) {
      const endIndex = template.indexOf('}}}', start + 3)
      if (endIndex === -1) return null

      const content = template.substring(start + 3, endIndex).trim()
      const node: VTNode = {
        type: 'raw-expression',
        content,
      }

      return { node, end: endIndex + 3 }
    }

    return null
  }

  private matchText(template: string, start: number): { content: string; end: number } | null {
    let i = start
    let content = ''

    while (i < template.length) {
      if (template.substring(i).startsWith('<vt:') ||
          template.substring(i).startsWith('{{') ||
          template.substring(i).startsWith('{{{')) {
        break
      }
      content += template[i]
      i++
    }

    if (content.length === 0) return null

    return { content, end: i }
  }

  private parseAttributes(content: string): Record<string, any> {
    const attributes: Record<string, any> = {}
    const regex = /(\w+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g
    let match

    while ((match = regex.exec(content)) !== null) {
      const key = match[1]
      const value = match[2] || match[3] || match[4] || true
      attributes[key] = value
    }

    return attributes
  }

  private generate(nodes: VTNode[], context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    let code = ''

    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          code += this.generateText(node, context)
          break
        case 'expression':
          code += this.generateExpression(node, context, false)
          break
        case 'raw-expression':
          code += this.generateExpression(node, context, true)
          break
        case 'vt-tag':
          code += this.generateVTTag(node, context)
          break
      }
    }

    return code
  }

  private generateText(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    return JSON.stringify(node.content || '')
  }

  private generateExpression(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }, raw: boolean): string {
    const content = node.content || ''
    const filters = this.parseFilters(content)

    let valueCode = this.evaluateExpression(filters.expression, context)

    // Apply filters in reverse order (last filter applied first)
    for (let i = filters.list.length - 1; i >= 0; i--) {
      const filter = filters.list[i]
      const filterFn = context.filters[filter.name]
      if (filterFn) {
        if (filter.args.length > 0) {
          valueCode = `__filters["${filter.name}"](${valueCode}, ${filter.args.map(a => JSON.stringify(a)).join(', ')})`
        } else {
          valueCode = `__filters["${filter.name}"](${valueCode})`
        }
      }
    }

    if (raw) {
      return `{${valueCode}}`
    }

    // Escape by default
    return `__escape(${valueCode})`
  }

  private parseFilters(content: string): { expression: string; list: Array<{ name: string; args: string[] }> } {
    // Simple filter parsing: "value | filter1 | filter2:arg1:arg2"
    const parts = content.split('|').map(p => p.trim())
    const expression = parts[0]
    const list: Array<{ name: string; args: string[] }> = []

    for (let i = 1; i < parts.length; i++) {
      const filterParts = parts[i].split(':')
      const name = filterParts[0].trim()
      const args = filterParts.slice(1).map(a => a.trim())
      list.push({ name, args })
    }

    return { expression, list }
  }

  private evaluateExpression(expr: string, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    // Handle dotted expressions: "post.title" -> __data.post?.title
    const parts = expr.split('.').map(p => p.trim())

    if (parts.length === 1) {
      const varName = parts[0]
      if (varName === 'theme') return '__theme'
      if (varName === 'page') return '__page'
      if (varName === 'posts') return '__posts'
      if (varName === 'user') return '__user'
      if (varName === 'settings') return '__settings'
      return `__data.${varName}`
    }

    // Dotted access
    let code = '__data'
    for (const part of parts) {
      if (part === 'theme') continue // Skip theme prefix
      code += `?.${part}`
    }

    return code
  }

  private generateVTTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const name = node.name || ''

    switch (name) {
      case 'layout':
        return this.generateLayoutTag(node, context)
      case 'extends':
        return this.generateExtendsTag(node, context)
      case 'each':
        return this.generateEachTag(node, context)
      case 'if':
        return this.generateIfTag(node, context)
      case 'slot':
        return this.generateSlotTag(node, context)
      case 'include':
        return this.generateIncludeTag(node, context)
      case 'block':
        return this.generateBlockTag(node, context)
      case 'component':
        return this.generateComponentTag(node, context)
      default:
        // Generic HTML-like tag
        return this.generateGenericTag(node, context)
    }
  }

  private generateLayoutTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    return `'' // Layout tag - use <vt:extends src="layout.vt"> instead`
  }

  private generateExtendsTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const src = node.attributes?.src || node.attributes?.[':src']
    if (!src) return "'' // Error: vt:extends requires src attribute"

    return `__includeTemplate(${JSON.stringify(src)}, __blocks)`
  }

  private generateEachTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const item = node.attributes?.item || node.attributes?.[':item'] || 'item'
    const index = node.attributes?.index || 'index'
    const inExpr = node.attributes?.in || node.attributes?.[':in']

    if (!inExpr) return "'' // Error: vt:each requires in attribute"

    const childrenCode = node.children ? this.generate(node.children, context) : "''"

    return `(() => {
      const __result = [];
      const __items = ${this.evaluateExpression(inExpr, context)} || [];
      for (let ${index} = 0; ${index} < __items.length; ${index}++) {
        const ${item} = __items[${index}];
        __result.push((() => { ${childrenCode} })());
      }
      return __result.join('');
    })()`
  }

  private generateIfTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const test = node.attributes?.test || node.attributes?.[':test']
    const elseNode = node.children?.find(c => c.type === 'vt-tag' && c.name === 'else')
    const ifChildren = node.children?.filter(c => c.type === 'vt-tag' && c.name !== 'else') || []
    const elseChildren = node.children?.filter(c => c.type === 'vt-tag' && c.name === 'else')[0]?.children || []

    if (!test) return "'' // Error: vt:if requires test attribute"

    const ifCode = ifChildren.length > 0 ? this.generate(ifChildren, context) : "''"
    const elseCode = elseChildren.length > 0 ? this.generate(elseChildren, context) : "''"

    return `(${this.evaluateExpression(test, context)} ? (() => { ${ifCode} })() : (() => { ${elseCode} })())`
  }

  private generateSlotTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const name = node.attributes?.name || 'content'
    return `__blocks["${name}"] || ''`
  }

  private generateIncludeTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const src = node.attributes?.src || node.attributes?.[':src']
    if (!src) return "'' // Error: vt:include requires src attribute"

    return `__includeTemplate(${JSON.stringify(src)}, __blocks)`
  }

  private generateBlockTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const name = node.attributes?.name
    if (!name) return "'' // Error: vt:block requires name attribute"

    const childrenCode = node.children ? this.generate(node.children, context) : "''"

    return `(() => { __blocks["${name}"] = (${childrenCode}); return ''; })()`
  }

  private generateComponentTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const name = node.attributes?.name || node.attributes?.[':name']
    if (!name) return "'' // Error: vt:component requires name attribute"

    return `__renderComponent("${name}", ${JSON.stringify(node.attributes || {})})`
  }

  private generateGenericTag(node: VTNode, context: { themePath: string; functions: Record<string, Function>; filters: Record<string, Function> }): string {
    const name = node.name || 'div'
    const attrs = node.attributes || {}

    let attrString = ''
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith(':') || key.startsWith('v-bind:')) {
        const attrName = key.replace(/^:|(?:v-bind:)/g, '')
        attrString += ` ${attrName}={${this.evaluateExpression(String(value), context)}}`
      } else if (key.startsWith('@') || key.startsWith('v-on:')) {
        const eventName = key.replace(/^@|(?:v-on:)/g, '')
        attrString += ` ${eventName}={${this.evaluateExpression(String(value), context)}}`
      } else {
        attrString += ` ${key}={${JSON.stringify(String(value))}}`
      }
    }

    const childrenCode = node.children ? this.generate(node.children, context) : "''"

    return `React.createElement("${name}", {${attrString}}, ${childrenCode})`
  }
}

export function compileTemplate(template: string, options?: VTCompileOptions): string {
  const compiler = new VTCompiler(options)
  return compiler.compile(template, options)
}

export function createCompiler(options?: VTCompileOptions): VTCompiler {
  return new VTCompiler(options)
}
