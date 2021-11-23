import React, { useState, useEffect, useMemo, createContext, useCallback, memo } from 'react'

const formContext = createContext()
const { Provider, Consumer } = formContext

export const Form = memo((props) => {
  const { model, children, component = 'form', ...others } = props

  if (!model) {
    return null
  }

  const C = component
  const content = !C ? children : <C {...others}>{children}</C>

  return (
    <Provider value={model}>
      {content}
    </Provider>
  )
})

const FieldController = memo((props) => {
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
    if (e && e.target && e.type) {
      views[name].value = e.target.value
    }
    else {
      views[name].value = e
    }
  }, [model, name, views])

  const view = views[name]

  const info = {
    ...views,
    ...view,
    model,
    onChange,
  }

  const attrs = typeof map === 'function' ? map(info) : info

  const Component = component
  return render ? render({ ...attrs, ...params, children })
    : component ? <Component {...attrs} {...params}>{children}</Component>
    : children
})

export const Field = memo((props) => {
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
          <FieldController
            {...others}
            model={model}
            name={name}
          />
        )
      }}
    </Consumer>
  )
})

// ------------------------------>>>>

function createFieldView(info, component = info.component) {
  if (!component) {
    return
  }

  const [C, base = {}] = [].concat(component)

  if (C === 'input') {
    const attrs = {
      value: info.value,
      onChange: info.onChange,
      placeholder: info.placeholder,
      readOnly: info.readonly,
      disabled: info.disabled,
      hidden: info.hidden,
      required: info.required,
      type: info.type,
      min: info.min,
      max: info.max,
      maxLength: info.maxLength,
      minLength: info.minLength,
      size: info.size,
      name: info.name,
      id: info.id,
      multiple: info.multiple,
      title: info.title,
      pattern: info.pattern,
      step: info.step,
      ...base,
    }
    return <C {...attrs} />
  }
  else if (C === 'textarea') {
    const attrs = {
      value: info.value,
      onChange: info.onChange,
      placeholder: info.placeholder,
      readOnly: info.readonly,
      disabled: info.disabled,
      hidden: info.hidden,
      required: info.required,
      cols: info.cols,
      maxLength: info.maxLength,
      rows: info.rows,
      wrap: info.wrap,
      ...base,
    }
    return <C {...attrs} />
  }
  else {
    return <C {...info} {...base} />
  }
}

export const FormField = memo((props) => {
  const { component, render, children, ...others } = props

  return (
    <Field {...others} render={(info) => {
      if (render) {
        return render(info)
      }

      const jsx = createFieldView(info, component)
      if (typeof jsx !== 'undefined') {
        return jsx
      }

      return children
    }} />
  )
})

export const FormItem = memo((props) => {
  const { model, name, label, className, ...attrs } = props

  return (
    <div className={className}>
      <label>
        <Field model={model} name={name} render={info => <span>{label ? label : info.label}{info.required ? <sup>*</sup> : null}</span>} />
        <FormField model={model} name={name} {...attrs} />
        <Field model={model} name={name} render={info => info.errors.length && info.changed ? <span><i>{info.errors.message}</i></span> : null} />
      </label>
    </div>
  )
})