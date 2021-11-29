# react-tyshemo-form

Easy react form driver based on [tyshemo](https://github.com/tangshuang/tyshemo) model.

## Install

```
npm i react-tyshemo-form tyshemo
```

Notice, you should must install `tyshemo` together.

## Usage

```js
import { Model, Meta } from 'tyshemo'
import { Form, FormItem } from 'react-tyshemo-form'
import { useMemo } from 'react'

class SomeModel extends Model {
  static name = new Meta({
    default: '',
    type: String,
    component: 'input', // will be used by FormItem
  })

  static age = new Meta({
    default: 0,
    type: Number,
    setter: v => +v,
    component: ['input', { type: 'number' }],
  })
}

function MyComponent() {
  const some = useMemo(() => new SomeModel())
  const handleSubmit = (e) => {
    e.preventDefault()
    const data = some.toData()
    // ...
  }

  return (
    <Form model={some} onSubmit={handleSubmit}>
      <FormItem name="name" />
      <FormItem name="age" />
    </Form>
  )
}
```

Read more from [demo](./demo/index.js).

## Components

### Form

The top provider of form.

- model: instance of Model, required
- component: ReactComponent or `false`, default is `form`, when `false` it will not wrap with any component
- other props will be passed into the given component

```js
<Form model={model}>
...
</Form>
```

### FormItem

A component to render a row.

- model?: can be inherited from `Form`
- name: which field to use
- label?: label to display, will override label of meta
- render?: function, if passed it will be used to render the field area
- component?: which component used to render
- className

```js
<Form model={model}>
  <FormItem name="name" />
</Form>
```

If the `name` meta has a property `component`, it can be used as component prop.

**label**

`FormItem` will use `label` of field meta as default, you can pass custom `label` to replace:

```js
class Some extends Meta {
  static label = 'default label'
}

<FormItem name="some" label="custom label" />
```

**component**

`FormItem` will use `component` of field meta as default, you can pass custom `component` to replace:

```js
class Some extends Meta {
  static component = 'input'
}

<FormItem name="some" component={Input} />
```

It receive an array to define default props of the component:

```js
<FormItem name="some" component={[Input, { onChange }]} />
```

**render**

Use a `render` function to generate custom layout:

```js
<FormItem name="some" render={(info) => {
  return <input value={info.value} onChange={info.onChange} />
}} />
```

Know more about `info` in `Field`.

### FormField

A component to render a field. In some cases, you do want to render the field input alone, you can use this component.

- model?
- name
- component?
- render?
- decorate?: a function to generate output by default content

```js
<Form model={model}>
  <div>
    Student: <FormField name="name" /> <FormField name="age" />
  </div>
</Form>
```

**decorate**

`FormField` generate the field component only, if you want to wrap the result, you can use `decorate` to wrap:

```js
const FormItem = memo((props) => {
  const { className, ...attrs } = props

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
```

Yes, this is the implement of `FormItem`.

### Field

A react component which drive the UI by model.

```js
<Field model={model} name="age">
  {({ value, onChange }) => {
    return <input type="number" value={value} onChange={e => onChange(e.target.value)} />
  }}
</Field>
```

Props:

- model: a tyshemo model instance
- name: field name of the model
- names?: field names which will be used inside
- render?: function to render
- map?: function, append more props to render or component

If `children` is function, it will be used to render, if not, you can pass `render` to receive `children` to render.

```js
<Field name="age" render={({ children }) => {
  ...
}} />
```

**render**

Use a `render` function to render.

```js
<Field model={model} name="age" render={({ value, onChange }) => {
  return <input type="number" value={value} onChange={e => onChange(e.target.value)} />
}} />
```

**info**

And the render function will receive a `info` object:

- model: current used model
- value: the current value of this field
- required: boolean, is current field should not be required (defined in model schema)
- disabeld: boolean
- readonly: boolean
- hidden: boolean
- errors: array, current validation results (not including type checking and required checking result, only result by validators)
- onChange(next): function, when you invoke `onChange` in the render function, the `Field` component will rerender
- other keys which is based on `name` and `names`

**map**

If these props are not enough for your requirement, you can use `map` to load more props:

```js
<Field name="age" map={(view) => {
  return {
    ...view,
    // override prop
    value: +view.value, // I want to make sure `value` is a number
  }
}} />
```

The appended props should be mreged into previous props. The return value of `map` will be passed into render function.

`Field` will only rerender when the `name` field's value change, this make it more performanceful.

**names**

In some cases, you need to use multiple fields in one section, then you should use `names` component.

```js
<Field
  model={model}
  name="key"
  names={['key1', 'key2']}
  render={({ key, key1, key2 }) => {
    // ...
  }}
/>
```

## Implement

The basic `Field` component is used by `FormField` and `FormItem`, you can use it to design your own components.

`Field` (without any UI) -> `FormField` (supports field component) -> `FormItem` (with label)
