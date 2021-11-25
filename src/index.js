import React, { useState, useEffect, useMemo, createContext, useCallback, memo } from 'react'

const formContext = createContext()
const { Provider, Consumer } = formContext

export function Form(props) {
  const { model, children, component, ...others } = props

  if (!model) {
    return null
  }

  const C = component
  const content = C ? <C {...others}>{children}</C> : children

  return (
    <Provider value={model}>
      {content}
    </Provider>
  )
}

function FieldView(props) {
  const {
    model,
    name,
    names = [],
    map,
    render,
    component,
    children,
    ...params
  } = props

  const nameList = [name, ...names].sort()

  const [, update] = useState()

  useEffect(() => {
    const forceUpdate = () => update({})
    nameList.forEach((name) => {
      model.watch(name, forceUpdate, true)
    })
    return () => nameList.forEach((name) => {
      model.unwatch(name, forceUpdate)
    })
  }, [model, nameList.join(',')])

  const views = useMemo(() => {
    const views = model.$views
    const items = {}
    nameList.forEach((name) => {
      const view = views[name]
      if (view) {
        items[name] = view
      }
    })
    return items
  }, [model, nameList.join(',')])

  const onChange = useCallback((e) => {
    if (e && e.target && e.target.value) {
      views[name].value = e.target.value
    }
    else {
      views[name].value = e
    }
  }, [model, name, views])

  const view = views[name]
  const { readonly: readOnly, ...others } = view

  const info = {
    ...views,
    ...others,
    model,
    view,
    readOnly,
    onChange,
  }

  const attrs = typeof map === 'function' ? map(info) : info

  const Component = component
  return component ? <Component {...attrs} {...params}>{children}</Component>
    : render ? render({ ...attrs, ...params, children })
    : children
}

const StaticFieldView = memo(FieldView)

export function Field(props) {
  return (
    <Consumer>
      {(contextModel) => {
        const { model = contextModel, name, ...others } = props

        // dont show if no model
        if (!model || !model.$views) {
          return null
        }

        const views = model.$views
        const view = views[name]

        // dont show not existing field
        if (!view) {
          return null
        }


        return (
          <StaticFieldView
            {...others}
            model={model}
            name={name}
          />
        )
      }}
    </Consumer>
  )
}


export function FieldItem(props) {
  const {
    model,
    name,
    names = [],
    map,
    render,
    component,
    children,
    label,
    ...attrs
  } = props

  return (
    <Field model={model} name={name} names={names} map={map} render={(ctx) => {
      return (
        <div>
          <label>{label}</label>
          {content}
        </div>
      )
    }} />
  )
}
