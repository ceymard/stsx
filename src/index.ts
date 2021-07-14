import { STSXNode, Child, SVGAttributes, HTMLAttributes, EmptyAttributes, Component, Attrs, ComponentFn, ArrayChild, FragmentNode, Writable } from './types'

export * from './types'


function flatten<T>(c: T[], res = [] as NonNullable<T>[]): NonNullable<T>[] {
  for (var i = 0, l = c.length; i < l; i++) {
    var child = c[i]
    if (Array.isArray(child)) {
      flatten(child, res)
    } else if (!!child) {
      res.push(child as NonNullable<T>)
    }
  }
  return res
}


const global_attributes = new Set([
  'accesskey',
  'style',
  'contenteditable',
  'dir',
  'draggable',
  'dropzone',
  'id',
  'lang',
  'spellcheck',
  'tabindex',
  'title',
  'translate',
])


export function s(elt: ComponentFn, attrs: Attrs | null, ...children: Child[]): STSXNode
export function s(elt: string, attrs: Attrs | null, ...children: Child[]): STSXNode
export function s<A>(elt: new (a: A) => Component<A>, attrs: A | null, ...children: Child[]): STSXNode
export function s(elt: any, attrs: Attrs | null, ...children: Child[]): STSXNode {
  var s!: STSXNode

  attrs = attrs ?? {}
  var {class: cls, ...rest} = attrs
  children = flatten(children)
  const is_basic_node = typeof elt === 'string'

  if (typeof elt === 'string') {
    s = new STSXNode(elt)
    s.children = children
  } else if (typeof elt?.prototype?.render === 'function') {
    // elt is a component !
    var c: Component<any> = new elt(attrs)
    s = c.render(children)
    s.component = c
  } else if (typeof elt === 'function') {
    s = elt(attrs, children)
  }

  for (var ch of children) {
    if (ch instanceof STSXNode)
      ch.parent = s
  }

  var a = s.attrs
  if (attrs) {
    var keys = Object.keys(attrs)
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]

      if (key === 'class') {
        var _k = attrs.class!
        var kls = Array.isArray(_k) ? flatten(_k!) : [_k]
        var klss = [] as string[]
        for (var j = 0, l3 = kls.length; j < l3; j++) {
          var item = kls[j]
          if (typeof item === 'string') {
            klss.push(item)
          } else {
            var keys2 = Object.keys(item)
            for (var k = 0, l2 = keys2.length; k < l2; k++) {
              var kls_key = keys2[k]
              if (!!((item as any)[kls_key as any])) {
                klss.push(kls_key)
              }
            }
          }
        }
        const old = s.attrs.class
        s.attrs.class = old != null ? old + ' ' + klss.join(' ') : klss.join(' ')
        // compute the class attribute
      } else if (global_attributes.has(key) || is_basic_node) {
        a[key] = (rest as any)[key]
      }
    }
  }

  return s
}

export namespace s {
  export const createElement = s
  export const Fragment = (a: Attrs, ch: Child[]) => {
    var n = new FragmentNode(ch)
    return n
  }
}


export namespace s.JSX {
  export type Element = STSXNode

  export interface ElementAttributesProperty {
    attrs: any
  }

  export interface ElementChildrenAttribute {
    $$children: ArrayChild
  }

  export interface ElementClassFn {
    (attrs: EmptyAttributes, children: DocumentFragment): Element
  }

  export type ElementClass = ElementClassFn | Component<Attrs>

  export interface IntrinsicElements {
    a: HTMLAttributes
    abbr: HTMLAttributes
    address: HTMLAttributes
    area: HTMLAttributes
    article: HTMLAttributes
    aside: HTMLAttributes
    audio: HTMLAttributes
    b: HTMLAttributes
    base: HTMLAttributes
    bdi: HTMLAttributes
    bdo: HTMLAttributes
    big: HTMLAttributes
    blockquote: HTMLAttributes
    body: HTMLAttributes
    br: HTMLAttributes
    button: HTMLAttributes
    canvas: HTMLAttributes
    caption: HTMLAttributes
    cite: HTMLAttributes
    code: HTMLAttributes
    col: HTMLAttributes
    colgroup: HTMLAttributes
    data: HTMLAttributes
    datalist: HTMLAttributes
    dd: HTMLAttributes
    del: HTMLAttributes
    details: HTMLAttributes
    dfn: HTMLAttributes
    dialog: HTMLAttributes
    div: HTMLAttributes
    dl: HTMLAttributes
    dt: HTMLAttributes
    em: HTMLAttributes
    embed: HTMLAttributes
    fieldset: HTMLAttributes
    figcaption: HTMLAttributes
    figure: HTMLAttributes
    footer: HTMLAttributes
    form: HTMLAttributes
    h1: HTMLAttributes
    h2: HTMLAttributes
    h3: HTMLAttributes
    h4: HTMLAttributes
    h5: HTMLAttributes
    h6: HTMLAttributes
    head: HTMLAttributes
    header: HTMLAttributes
    hr: HTMLAttributes
    html: HTMLAttributes
    i: HTMLAttributes
    iframe: HTMLAttributes
    img: HTMLAttributes
    input: HTMLAttributes
    ins: HTMLAttributes
    kbd: HTMLAttributes
    keygen: HTMLAttributes
    label: HTMLAttributes
    legend: HTMLAttributes
    li: HTMLAttributes
    link: HTMLAttributes
    main: HTMLAttributes
    map: HTMLAttributes
    mark: HTMLAttributes
    menu: HTMLAttributes
    menuitem: HTMLAttributes
    meta: HTMLAttributes
    meter: HTMLAttributes
    nav: HTMLAttributes
    noscript: HTMLAttributes
    object: HTMLAttributes
    ol: HTMLAttributes
    optgroup: HTMLAttributes
    option: HTMLAttributes
    output: HTMLAttributes
    p: HTMLAttributes
    param: HTMLAttributes
    picture: HTMLAttributes
    pre: HTMLAttributes
    progress: HTMLAttributes
    q: HTMLAttributes
    rp: HTMLAttributes
    rt: HTMLAttributes
    ruby: HTMLAttributes
    s: HTMLAttributes
    samp: HTMLAttributes
    script: HTMLAttributes
    section: HTMLAttributes
    select: HTMLAttributes
    small: HTMLAttributes
    source: HTMLAttributes
    span: HTMLAttributes
    strong: HTMLAttributes
    style: HTMLAttributes
    sub: HTMLAttributes
    summary: HTMLAttributes
    sup: HTMLAttributes
    table: HTMLAttributes
    tbody: HTMLAttributes
    td: HTMLAttributes
    textarea: HTMLAttributes
    tfoot: HTMLAttributes
    th: HTMLAttributes
    thead: HTMLAttributes
    time: HTMLAttributes
    title: HTMLAttributes
    tr: HTMLAttributes
    track: HTMLAttributes
    u: HTMLAttributes
    ul: HTMLAttributes
    'var': HTMLAttributes
    video: HTMLAttributes
    wbr: HTMLAttributes

    svg: SVGAttributes
    circle: SVGAttributes
    clipPath: SVGAttributes
    defs: SVGAttributes
    desc: SVGAttributes
    ellipse: SVGAttributes
    feBlend: SVGAttributes
    feColorMatrix: SVGAttributes
    feComponentTransfer: SVGAttributes
    feComposite: SVGAttributes
    feConvolveMatrix: SVGAttributes
    feDiffuseLighting: SVGAttributes
    feDisplacementMap: SVGAttributes
    feDistantLight: SVGAttributes
    feFlood: SVGAttributes
    feFuncA: SVGAttributes
    feFuncB: SVGAttributes
    feFuncG: SVGAttributes
    feFuncR: SVGAttributes
    feGaussianBlur: SVGAttributes
    feImage: SVGAttributes
    feMerge: SVGAttributes
    feMergeNode: SVGAttributes
    feMorphology: SVGAttributes
    feOffset: SVGAttributes
    fePointLight: SVGAttributes
    feSpecularLighting: SVGAttributes
    feSpotLight: SVGAttributes
    feTile: SVGAttributes
    feTurbulence: SVGAttributes
    filter: SVGAttributes
    foreignObject: SVGAttributes
    g: SVGAttributes
    image: SVGAttributes
    line: SVGAttributes
    linearGradient: SVGAttributes
    marker: SVGAttributes
    mask: SVGAttributes
    metadata: SVGAttributes
    path: SVGAttributes
    pattern: SVGAttributes
    polygon: SVGAttributes
    polyline: SVGAttributes
    radialGradient: SVGAttributes
    rect: SVGAttributes
    stop: SVGAttributes
    switch: SVGAttributes
    symbol: SVGAttributes
    text: SVGAttributes
    textPath: SVGAttributes
    tspan: SVGAttributes
    use: SVGAttributes
    view: SVGAttributes

  }
}


export class Repeater<T> extends STSXNode {
  constructor(
    public lst: T[],
    public renderer: (t: T, i: number, lst: T[]) => Child,
    public separator?: Child
  ) { super(null!) }

  render(out: Writable) {
    out.write('<!-- Repeat -->')
    const rd = this.renderer
    const sep = this.separator
    for (var i = 0, lst = this.lst, l = lst.length; i < l; i++) {
      if (i > 0 && sep) {
        this.renderChild(out, sep)
      }
      this.renderChild(out, rd(lst[i], i, lst))
    }
    out.write('<!-- end repeat -->')
  }
}


export function Repeat<T>(lst: T[], render: (item: T, idx: number, lst: T[]) => Child, separator?: Child) {
  return new Repeater(lst, render, separator)
}


export class IfNode<T> extends STSXNode {
  els?: () => Child
  constructor(public cond: T, public then: (it: NonNullable<T>) => Child) {
    super(null!)
  }

  render(out: Writable) {
    out.write(`<!-- If -->`)
    if (this.cond) {
      this.renderChild(out, this.then(this.cond!))
    } else if (this.els) {
      this.renderChild(out, this.els())
    }
    out.write(`<!-- /If -->`)
  }

  ElseIf<U>(cond: U, then: (it: NonNullable<U>) => Child) {
    if (!this.cond) {
      return new IfNode(cond, then)
    }
    return this
  }

  Else(then: () => Child) {
    this.els = then
    return this
  }
}

export function If<T>(cond: T, then: (it: NonNullable<T>) => STSXNode) {
  return new IfNode(cond, then)
}

export class Switcher<T> extends STSXNode {

  cases = [] as [T | ((t: T) => boolean), (t: T) => Child][]

  constructor(public value: T) {
    super(null!)
  }

  render(out: Writable) {
    out.write(`<!-- Switch -->`)
    for (var i = 0, cs = this.cases, l = cs.length; i < l; i++) {
      var [cond, rd] = cs[i]
      if (cond === this.value)
        this.renderChild(out, rd(this.value))
      // else if (typeof cond === 'function' && (cond as any)(this.value))
        // this.renderChild(out, rd(this.value))
    }
    out.write(`<!-- /Switch -->`)
  }

  Case(val: T | ((t: T) => boolean), render: (t: T) => Child) {
    this.cases.push([val, render])
    return this
  }
}

export function Switch<T>(val: T) {
  return new Switcher(val)
}

export * from './template'
