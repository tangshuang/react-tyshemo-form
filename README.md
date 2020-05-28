# React-Tyshemo-Form

Easy react form driver based on tyshemo model.

## Install

```
npm i react-tyshemo-form
```

## Usage

```js
import { Field, Model, useLocal } from 'react-tyshemo-form'

class SomeModel extends Model {

  static name = {
    default: '',
    type: String,
  }

  static age = {
    default: 0,
    type: Number,
    setter: v => +v,
  }

}

function MyComponent() {
  const model = useLocal(() => SomeModel)

  return (
    <form>
      <Field model={model} name="age" render={({ value, onChange }) => {
        return <input type="number" value={value} onChange={e => onChange(e.target.value)} />
      }} />
    </form>
  )
}
```

Read more from [demo](./_demo/app.jsx).

## Field

A react component which drive the UI by model.

```js
<Field model={model} name="age" render={({ value, onChange }) => {
  return <input type="number" value={value} onChange={e => onChange(e.target.value)} />
}} />
```

Props:

- model: a tyshemo model instance
- name: field name of the model
- component: which component to be used to render
- render: function to render
- extend?: function, append more props to render or component

**component**

When you pass `component` prop, `render` will not work.

```js
<Field model={model} name="age" component={AgeComponent} />
```

**render**

Use a `render` function to render.

```js
<Field model={model} name="age" render={({ value, onChange }) => {
  return <input type="number" value={value} onChange={e => onChange(e.target.value)} />
}} />
```

The difference between `component` and `render` is that, render function will be run each time when component update.
It is recommend to use `component` at all. Because `component` make it more performanceful.

**props**

As you seen, in react, you can create functional components, which is the same structure with `render` function. So, use `component` will always work no matter you use functional components or class components.
And the component or function will receive a `view` object:

- value: the current value of this field
- required: boolean, is current field should not be required (defined in model schema)
- disabeld: boolean
- readonly: boolean
- hidden: boolean
- errors: array, current validation results (not including type checking and required checking result, only result by validators)
- onChange(next): function, when you invoke `onChange` in the render function, the `Field` component will rerender

If these props are not enough for your requirement, you can use `extend` to append more props:

```js
<Field name="age" extend={(view) => {
  return {
    // append props
    name: model.name, // i.e. I want to use another field of model for this field UI, I have to append it here
  }
}} />
```

The appended props will be mreged into previous props, if some prop has been existing, it will be override.
When to use `extend`? When the component's needing props names are not the same as given, or need more props.