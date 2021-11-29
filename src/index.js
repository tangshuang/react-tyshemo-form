import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useCallback,
  memo,
} from 'react'

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
    children,
    render,
    keepAlive,
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

  if (view.hidden && !keepAlive) {
    return null
  }

  const info = {
    ...views,
    ...view,
    model,
    onChange,
  }

  const attrs = typeof map === 'function' ? map(info) : info

  return typeof children === 'function' ? children(attrs)
    : typeof render === 'function' ? render(attrs) :
    children
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
  const pick = (keys) => {
    const obj = {}
    keys.forEach((key) => {
      obj[key] = info[key]
    })
    return obj
  }

  if (C === 'input') {
    const attrs = {
      ...pick(['value', 'onChange', 'placeholder', 'disabled', 'hidden', 'required', 'type', 'min', 'max', 'maxLength', 'size', 'multiple', 'pattern', 'step']),
      readOnly: info.readonly,
      ...base,
    }
    return <C {...attrs} />
  }
  else if (C === 'textarea') {
    const attrs = {
      ...pick(['value', 'onChange', 'placeholder', 'disabled', 'hidden', 'required', 'cols', 'rows', 'maxLength', 'wrap']),
      readOnly: info.readonly,
      ...base,
    }
    return <C {...attrs} />
  }
  else {
    return <C {...info} {...base} />
  }
}

export const FormField = memo((props) => {
  const { component, render, children, decorate, ...attrs } = props

  return (
    <Field {...attrs}>
      {(info) => {
        let content = children

        if (typeof children === 'function') {
          content = children(info)
        }
        else if (render) {
          content = render(info)
        }
        else {
          const jsx = createFieldView(info, component)
          if (typeof jsx !== 'undefined') {
            content = jsx
          }
        }

        if (decorate) {
          content = decorate(info, content)
        }

        return content
      }}
    </Field>
  )
})

export const FormItem = memo((props) => {
  const { className, label, ...attrs } = props

  return (
    <FormField {...attrs} decorate={(info, content) => {
      return (
        <div className={className}>
          <label>
            <span>{label ? label : info.label}{info.required ? <sup>*</sup> : null}</span>
            {content}
            {info.errors.length && info.changed ? <i>{info.errors.message}</i> : null}
          </label>
        </div>
      )
    }} />
  )
})
