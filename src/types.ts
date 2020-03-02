import * as fs from 'fs'
import * as resolve from 'resolve'
import * as pth from 'path'

export interface Writable {
  write(str: string): any
}

export type UnArray<T> = T extends (infer U)[] ? never : T

export type Child = null | undefined | boolean | number | string | STSXNode
export type ArrayChild = Child | ArrayChild[]

const self_closing = new Set([
  'area',
  'base',
  'br',
  'embed',
  'hr',
  'iframe',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
])

function safe_html(s: string, in_attrib = false) {
  return s.replace(/[<>]/g, m =>
    m === '&' ? '&amp;' :
    m === '<' ? '&lt;' :
    m === '>' ? '&gt;' :
    in_attrib && m === '"' ? '&quot;' :
    in_attrib && m === "'" ? '&#39;' :
    m
  )
}

const inspect = Symbol.for('nodejs.util.inspect.custom');


export class STSXNode {
  // name: string = ''
  attrs: {[name: string]: string} = {}
  children: Child[] = []
  parent = null as STSXNode | null
  component?: Component<any> // the original component

  constructor(public name: string) {

  }

  query<C extends Component<any>>(c: {new(a: any): C}): C | null {
    return null
  }

  render(out: Writable) {
    out.write(`<${this.name}`)
    const attrs = this.attrs
    const attr_keys = Object.keys(attrs)
    if (attr_keys.length) {
      for (var i = 0, l = attr_keys.length; i < l; i++) {
        var att = attr_keys[i]
        if (attrs[att] != null)
          out.write(` ${att}="${safe_html(attrs[att], true)}"`)
      }
    }

    if (self_closing.has(this.name) && this.children.length === 0) {
      out.write('/>')
      return
    } else {
      out.write('>')
    }

    this.renderChildren(out)

    out.write(`</${this.name}>`)
  }

  toString(): string {
    const parts = [] as string[]
    const outstr = {write(s: string) { parts.push(s) }}
    this.render(outstr)
    return parts.join('')
  }

  [inspect](): string {
    return this.toString()
  }

  renderChild(out: Writable, child: Child) {
    if (child instanceof STSXNode)
      child.render(out)
    else if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
      out.write(safe_html(child.toString()))
    }
  }

  renderChildren(out: Writable) {
    for (var i = 0, c = this.children, l = c.length; i < l; i++) {
      var child = c[i]
      this.renderChild(out, child)
    }
  }
}

export class FragmentNode extends STSXNode {
  constructor(children: Child[]) {
    super(null!)
    this.children = children
  }
  render(out: Writable) {
    this.renderChildren(out)
  }
}


export class CDataNode extends STSXNode {
  render(out: Writable) {
    out.write('<![CDATA[')
    out.write(this.name)
    out.write(']]>')
  }
}


export function cdata(cdata: string) {
  return new CDataNode(cdata)
}


export class Raw extends STSXNode {
  render(out: Writable) {
    out.write(this.name)
  }
}


export class Include extends STSXNode {
  constructor(public path: string) {
    super(null!)
  }
  render(out: Writable) {
    const path = this.path
    try {
      //
      out.write(fs.readFileSync(path, 'utf-8'))
    } catch (e) {
      if (path[0] !== '.') {
        var [modname, ...rest] = path.split(new RegExp(pth.sep))
        // console.log(path, modname, rest, pth.sep)
        var resolved = resolve.sync(modname)
        // console.log(resolved)
        var found_file = pth.join(pth.dirname(resolved), rest.join(pth.sep))
        // console.log(found_file)
        out.write(fs.readFileSync(found_file, 'utf-8'))
      }
    }
  }
}

/**
 * Include a file contents, optionally html-escaped
 * @param path Path to the file to be included.
 */
export function include(path: string) {
  return new Include(path)
}

export function raw(s: string): STSXNode {
  return new Raw(s)
}

export type ClassDefinition = string | {[name: string]: any} | ClassDefinition[]
export type StyleDefinition = string | Partial<CSSStyleDeclaration> | StyleDefinition[]


export type Null<T> = T | null


export class Component<A> {
  constructor(public attrs: A & EmptyAttributes) { }
  render(child: Child[]): STSXNode { return null! }
}

// export interface Component<A> {
//   attrs: A
//   new(attrs: A): this
//   render(children: Child[]): STSXNode
// }

export interface ComponentFn {
  (attrs: EmptyAttributes, children: Child[]): Element
}


export interface EmptyAttributes {
  $$children?: ArrayChild
}

/**
 * Basic attributes used on all HTML nodes.
 *
 * This type should be used as first argument to all components definitions.
 */
export interface Attrs extends EmptyAttributes {
  id?: Null<string>
  contenteditable?: Null<'true' | 'false' | 'inherit'>
  hidden?: Null<boolean>
  accesskey?: Null<string>
  dir?: Null<'ltr' | 'rtl' | 'auto'>
  draggable?: Null<'true' | 'false' | 'auto'>
  dropzone?: Null<'copy' | 'move' | 'link'>
  lang?: Null<string>
  spellcheck?: Null<boolean>
  tabindex?: Null<number>
  title?: Null<string>
  translate?: Null<'yes' | 'no'>

  class?: ClassDefinition | ClassDefinition[] // special attributes
  style?: StyleDefinition

  xmlns?: Null<string>
}



///////////////////////////////////////////////////////////////////////////
// Now following are the default attributes for HTML and SVG nodes.


export interface HTMLAttributes extends Attrs {

  // Attributes shamelessly stolen from React's type definitions.
  // Standard HTML Attributes
  accept?: Null<string>
  'accept-charset'?: Null<string>
  accesskey?: Null<string>
  action?: Null<string>
  allowfullscreen?: Null<boolean>
  allowtransparency?: Null<boolean>
  alt?: Null<string>
  async?: Null<boolean>
  autocomplete?: Null<string>
  autofocus?: Null<boolean>
  autoplay?: Null<boolean>
  capture?: Null<boolean>
  cellpadding?: Null<number | string>
  cellspacing?: Null<number | string>
  charset?: Null<string>
  challenge?: Null<string>
  checked?: Null<boolean>
  classid?: Null<string>
  classname?: Null<string>
  cols?: Null<number>
  colspan?: Null<number>
  content?: Null<string>
  // contenteditable?: NRO<boolean>
  contextmenu?: Null<string>
  controls?: Null<boolean>
  coords?: Null<string>
  crossorigin?: Null<string>
  data?: Null<string>
  datetime?: Null<string>
  default?: Null<boolean>
  defer?: Null<boolean>
  // dir?: NRO<string>
  disabled?: Null<boolean>
  download?: Null<any>
  // draggable?: NRO<boolean>
  enctype?: Null<string>
  for?: Null<string>
  form?: Null<string>
  formaction?: Null<string>
  formenctype?: Null<string>
  formmethod?: Null<string>
  formnovalidate?: Null<boolean>
  formtarget?: Null<string>
  frameborder?: Null<number | string>
  headers?: Null<string>
  height?: Null<number | string>
  hidden?: Null<boolean>
  high?: Null<number>
  href?: Null<string>
  hreflang?: Null<string>
  htmlfor?: Null<string>
  'http-equiv'?: Null<string>
  icon?: Null<string>
  id?: Null<string>
  inputmode?: Null<string>
  integrity?: Null<string>
  is?: Null<string>
  keyparams?: Null<string>
  keytype?: Null<string>
  kind?: Null<string>
  label?: Null<string>
  // lang?: NRO<string>
  list?: Null<string>
  loop?: Null<boolean>
  low?: Null<number>
  manifest?: Null<string>
  marginheight?: Null<number>
  marginwidth?: Null<number>
  max?: Null<number | string>
  maxlength?: Null<number>
  media?: Null<string>
  mediagroup?: Null<string>
  method?: Null<string>
  min?: Null<number | string>
  minlength?: Null<number>
  multiple?: Null<boolean>
  muted?: Null<boolean>
  name?: Null<string>
  novalidate?: Null<boolean>
  open?: Null<boolean>
  optimum?: Null<number>
  pattern?: Null<string>
  placeholder?: Null<string>
  poster?: Null<string>
  preload?: Null<string>
  radiogroup?: Null<string>
  readonly?: Null<boolean>
  rel?: Null<string>
  required?: Null<boolean>
  role?: Null<string>
  rows?: Null<number>
  rowspan?: Null<number>
  sandbox?: Null<string>
  scope?: Null<string>
  scoped?: Null<boolean>
  scrolling?: Null<string>
  seamless?: Null<boolean>
  selected?: Null<boolean>
  shape?: Null<string>
  size?: Null<number>
  sizes?: Null<string>
  span?: Null<number>
  spellcheck?: Null<boolean>
  src?: Null<string>
  srcdoc?: Null<string>
  srclang?: Null<string>
  srcset?: Null<string>
  start?: Null<number>
  step?: Null<number | string>
  summary?: Null<string>
  tabindex?: Null<number>
  target?: Null<string>
  title?: Null<string>
  type?: Null<string>
  usemap?: Null<string>
  value?: Null<string | number | boolean>
  width?: Null<number | string>
  wmode?: Null<string>
  wrap?: Null<string>

  // RDFa Attributes
  about?: Null<string>
  datatype?: Null<string>
  inlist?: Null<any>
  prefix?: Null<string>
  property?: Null<string>
  resource?: Null<string>
  typeof?: Null<string>
  vocab?: Null<string>

  // Non-standard Attributes
  autocapitalize?: Null<'word' | 'words' | 'sentences' | 'sentence' | 'characters' | 'character' | 'off'>
  autocorrect?: Null<string>
  autosave?: Null<string>
  color?: Null<string>
  itemprop?: Null<string>
  itemscope?: Null<boolean>
  itemtype?: Null<string>
  itemid?: Null<string>
  itemref?: Null<string>
  results?: Null<number>
  security?: Null<string>
  unselectable?: Null<boolean>
}

export interface SVGAttributes extends Attrs {
  'clip-path'?: string;
  cx?: Null<number | string>
  cy?: Null<number | string>
  d?: Null<string>
  dx?: Null<number | string>
  dy?: Null<number | string>
  fill?: Null<string>
  'fill-opacity'?: Null<number | string>
  'font-family'?: Null<string>
  'font-size'?: Null<number | string>
  fx?: Null<number | string>
  fy?: Null<number | string>
  gradientTransform?: Null<string>
  gradientUnits?: Null<string>
  height?: Null<number | string>
  href?: Null<string>
  'marker-end'?: Null<string>
  'marker-mid'?: Null<string>
  'marker-start'?: Null<string>
  offset?: Null<number | string>
  opacity?: Null<number | string>
  patternContentUnits?: Null<string>
  patternUnits?: Null<string>
  points?: Null<string>
  preserveAspectRatio?: Null<string>
  r?: Null<number | string>
  rx?: Null<number | string>
  ry?: Null<number | string>
  space?: Null<string>
  spreadMethod?: Null<string>
  startOffset?: Null<string>
  'stop-color'?: Null<string>
  'stop-opacity'?: Null<number | string>
  stroke?: Null<string>
  'stroke-dasharray'?: Null<string>
  'stroke-linecap'?: Null<string>
  'stroke-opacity'?: Null<number | string>
  'stroke-width'?: Null<number | string>
  'text-anchor'?: Null<string>
  'text-decoration'?: Null<string>
  transform?: Null<string>
  version?: Null<string>
  viewBox?: Null<string>
  width?: Null<number | string>
  x1?: Null<number | string>
  x2?: Null<number | string>
  x?: Null<number | string>
  y1?: Null<number | string>
  y2?: Null<number | string>
  y?: Null<number | string>
}
