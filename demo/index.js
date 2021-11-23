import { Form, FormItem, FormField } from '../src/index.js'
import { Model, Meta, Validator } from 'tyshemo'
import { useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom'

class Student extends Model {
  static std_name = new Meta({
    label: 'Name',
    default: '',
    component: 'input',
    required: true,
    validators: [
      Validator.required('name should not be empty'),
    ],
  })

  static std_age = new Meta({
    label: 'Age',
    default: 0,
    component: ['input', { type: 'number' }],
    required: true,
    validators: [
      Validator.required('age should not be empty'),
    ],
    watch(e) {
      console.log(e)
    }
  })

  static std_no = new Meta({
    label: 'No.',
    default: '',
    component: 'input',
  })
}


function App() {
  const std = useMemo(() => new Student())
  const onSubmit = (e) => {
    e.preventDefault()
    console.log(std.toData())
  }

  return (
    <Form model={std} component="form" onSubmit={onSubmit}>
      <FormItem name="std_name" />
      <FormItem name="std_age" />
      <FormItem name="std_no" />

      Only Fields:
      <FormField name="std_name" />
      <FormField name="std_age" />
      <FormField name="std_no" />
      <button>Submit</button>
    </Form>
  )
}

ReactDOM.render(<App />, document.querySelector('#app'))
