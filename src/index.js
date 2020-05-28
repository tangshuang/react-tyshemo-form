import React, { useMemo } from 'react'
import { useObserver } from 'react-tyshemo'

export * from 'react-tyshemo'

export function Field(props) {
  const { model, name, render, component: Component, extend, children, deps = [] } = props
  const keys = [name, ...deps]

  useObserver(
    dispatch => keys.forEach(key => model.watch(key, dispatch, true)),
    dispatch => keys.forEach(key => model.unwatch(key, dispatch)),
    [model, ...keys],
  )

  const view = model.$views[name]
  const attrs = {
    ...view,
    onChange(value) {
      view.value = value
    },
  }

  const merged = typeof extend === 'function' ? extend(attrs) : {}
  const final = {
    ...attrs,
    ...merged,
  }

  return Component ? <Component {...final}>{children}</Component> : render ? render({ ...final, children }) : null
}