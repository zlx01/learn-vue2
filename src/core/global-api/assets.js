/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          // 全局注册组件本质是通过 Vue.extend 创建一个子类，
          // 然后将子类存储在 Vue.options.components 中
          // 用 _base 是为了在 definition 中用this访问的是Vue构造函数，而不是子类
          definition = this.options._base.extend(definition)
        }
        // 简写语法糖
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
