import { Child, STSXNode, raw } from "./types"


export interface Block {
  (attrs: {}, ch: Child[]): STSXNode
  Display(attrs: {}, ch: Child[]): STSXNode
}

export interface ExtensibleBlock extends Block {
  Super(attrs: {}, ch: Child[]): STSXNode
}

export function create_block(name: string, append: true): Block
export function create_block(name: string): ExtensibleBlock
export function create_block(name: string, append = false) {
  var children = [] as Child[][]

  function Block(a: any, ch: Child[]) {
    children.push(ch) // a block just pushes its definition.
    return raw(`<!-- ${name ?? 'Block'} -->`)
  }

  class Super extends STSXNode {
    render(out: NodeJS.WritableStream) {
      out.write(`<!-- Super ${name ?? 'Block'} -->`)
      var chlds = children.shift()
      for (var c of (chlds ?? []))
        this.renderChild(out, c)
      // check the children
    }
  }

  class Display extends STSXNode {
    render(out: NodeJS.WritableStream) {
      out.write(`<!-- Display ${name ?? 'Block'} -->`)
      const display = () => {
        var chlds = children.shift()
        if (chlds) {
          for (var c of chlds) {
            this.renderChild(out, c)
          }
        }
      }
      if (append) {
        while (children.length) display()
      } else {
        display()
      }
      children = []
    }
  }

  // block.super cannot immediately resolve since when
  // block is called first with its own, new definition,
  // so we have to cheat by having an STSXNode that
  if (!append)
    Block.Super = function () {
      return new Super(null!)
    }

  // Display is called last, when all the children are already filled
  Block.Display = function () {
    return new Display(null!)
  }

  return Block as ExtensibleBlock
}
