/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 防止重复安装
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this // return Vue to allow chaining
    }

    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this) // 将 Vue 作为第一个参数传入插件，方便插件扩展 Vue
    if (typeof plugin.install === 'function') {
      // 插件是一个带有 install 方法的对象
      // 等价于 plugin.install(Vue, ...args)
      // install 中的 this 是 plugin 对象本身
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 插件是一个函数
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}
