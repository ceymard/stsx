import { Child } from "./types"

// Two ways of extending : append points and overload.
// append points are places where it is defined that things will be appended
// with all the includes. Otherwise includes are done by overloading methods,
// last one included answers first.
// There should be a handling of default values, like for example
// with 'title'


export interface PartInstanciator {

}

export type Cache = Map<{new(cache: Cache): Part}, Part>
const priv = Symbol('private') as any

/**
 *
 */
export class Part {

  get body(): (() => Child)[] {
    return (this.cache.get(priv) as any).body_append
  }

  get head(): (() => Child)[] {
    return (this.cache.get(priv) as any).head_append
  }

  cache: Cache
  public constructor(cache?: Cache) {
    this.cache = cache ?? new Map()
    this.cache.set(this.constructor as any, this)
    if (!this.cache.has(priv)) {
      this.cache.set(priv, {
        head_append: [],
        body_append: []
      } as any)
    }
  }

  init() { }

  /**
   * Partials should be recursive
   * @param obj Yeah
   */
  assign(obj: Partial<this>) {
    for (var i = 0, keys = Object.keys(obj as any), l = keys.length; i < l; i++) {
      var key = keys[i];
      (this as any)[key] = (obj as any)[key]
    }
  }

  setPart<U extends {new(): Part}>(creator: U, respec?: Partial<InstanceType<U>>): this {
    const inst = this.cache.get(creator)!
    inst.assign(respec as any)
    return this
  }

  use<U extends {new(cache: Cache): Part}>(part_creator: U, respec?: Partial<InstanceType<U>>): InstanceType<U> {
    var inst: any = this.cache.get(part_creator)
    if (inst == undefined) {
      inst = new part_creator(this.cache)
      this.cache.set(part_creator, inst)
      inst.init()
    }
    if (respec != undefined)
      inst.assign(respec)
    return inst
  }

  get<U extends {new(): Part}>(creator: U): InstanceType<U> {
    if (this instanceof creator) return this as any
    else
    return (this as any).cache.get(creator) as any
  }

}