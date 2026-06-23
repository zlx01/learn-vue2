/* @flow */

import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions } from '../util/index'

/**
 * _uid 的作用是：给每一个 Vue 实例分配一个唯一的内部编号。它不是用户 API，主要给 Vue 内部做实例识别、调试标记、生成唯一 key 用。
 * [create-functional-component.js (line 25)]里用 hasOwn(parent, '_uid') 判断传进来的 parent 是否是真实组件实例，还是已经包装过的函数式组件 context。
 */
let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // new Vue() 的时候会走这里
      console.log('User Component')
      console.log('vm', vm)
      console.log('options', options)
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
      console.log('After merging ConstructorOptions and Options')
      console.log('vm.$options', vm.$options)
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self 没搜到，有用？
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  console.log('initInternalComponent')
  console.log('vm', vm)
  console.log('options', options)
  const opts = vm.$options = Object.create(vm.constructor.options)
  // vm.constructor.options === Vue.options
  // 从 global-api/index.js 可以找到 Vue.options 的定义
  console.log('vm.constructor.options', vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }

  console.log('vm.$options', vm.$options)
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  console.log('Ctor', Ctor)
  console.log('Ctor.options', Ctor.options)
  console.log(Ctor.super ? 'Ctor has super' : 'Ctor has no super')
  let options = Ctor.options
  console.log('Before merging super ConstructorOptions', options)
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  console.log('After merging super ConstructorOptions', options)
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
