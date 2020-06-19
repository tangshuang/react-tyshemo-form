# React-Tyshemo-Form

Easy react form driver based on tyshemo model.

> react-tyshemo-form is moved into react-tyshemo, you can import Filed component from [react-tyshemo/form](https://github.com/tangshuang/react-tyshemo).

## Install

```
npm i react-tyshemo-form tyshemo
```

Notice, you should must install `tyshemo` together.

## Usage

```js
import { Model } from 'tyshemo'
import { useLocal } from 'react-tyshemo'
import { Field } from 'react-tyshemo-form'
// import { Field } from 'react-tyshemo/form'

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

function useModel() {
  const model = useLocal(function() {
    return SomeModel
  })
  return model
}

function MyComponent() {
  const model = useModel()

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
- map?: function, append more props to render or component

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

## Fields

In some cases, you need to use multiple fields in one section, then you should use `Fields` component.

```js
import { Fields } from 'react-tyshemo-form'

<Fields
  model={model}
  names={['key1', 'key2']}
  map={([view1, view2]) => {
    // ...
    // should return an array
  }}
  render={([view1, view2]) => {
    // ...
  }}
/>
```

Notice here, `names` changes to be an array, and the paramter of `map` and `render` change to an array too.

`Fields` only rerenders when the passed names' value of model change, the same as `Field` does.
