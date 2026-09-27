/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      // Waterer记住了这个Dep，addDep内部也会调用 dep.addSub(this)
      // 让Dep记住这个Waterer
      Dep.target.addDep(this)
    }
  }

  // 当响应式属性被修改时，setter 里会调用
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// Vue 全局同时只能有一个“当前正在收集依赖的 watcher”。这个 watcher 就存在 Dep.target 上。
// 为什么可以全局唯一？因为 JS 是单线程执行的，同一时刻只会有一个 watcher 正在执行 getter/render。
Dep.target = null
// 但 watcher 可能嵌套。比如渲染过程中访问 computed，computed 内部又会触发自己的 watcher 求值。所以 Vue 用了一个栈：
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
