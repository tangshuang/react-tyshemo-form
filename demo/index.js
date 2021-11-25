import { Form, Field } from '../src/index.js'
import { Model, Meta } from 'tyshemo'
import { useMemo } from 'react'
import ReactDOM from 'react-dom'

class Student extends Model {
  static std_name = new Meta({
    default: '',
  })

  static std_age = new Meta({
    default: 0,
  })

  static std_no = new Meta({
    default: '',
  })
}


function App() {
  const std = useMemo(() => new Student())

  return (
    <Form model={std} component="form">
      <Field name="std_name" component="input" />
      <Field name="std_age" component="input" type="number" />
      <Field name="std_no" component="input" />
    </Form>
  )
}

ReactDOM.render(<App />, document.querySelector('#app'))
