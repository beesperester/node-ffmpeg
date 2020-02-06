// Node related imports
import assert from 'assert'
// Cmdli related imports
import { CmdliConstraintError } from './errors'
import { constraintFlags } from './index'

export const reduceArray = (previous, current) => {
  return previous.concat(current)
}

export const filterEmpty = (value) => {
  return value ? value.trim() !== '' : false
}

export const assertType = (expected) => (received) => {
  for (const prop in expected) {
    assert(received, 'Received value must not be empty')
    assert(prop in received, `Received value is missing property ${prop}`)
  }
}

export const assertConstraints = (argument) => (input) => {
  argument.constraints.forEach((constraint) => {
    if (constraint.flag === constraintFlags.mustNotExist) {
      const matches = input.arguments.filter((x) => x.argument === constraint.argument)

      if (matches.length > 0) {
        throw new CmdliConstraintError(`Argument ${argument.argument} must not be used with ${constraint.argument}`)
      }
    }

    if (constraint.flag === constraintFlags.mustExist) {
      const matches = input.arguments.filter((x) => x.argument === constraint.argument)

      if (matches.length === 0) {
        throw new CmdliConstraintError(`Argument ${argument.argument} must be used with ${constraint.argument}`)
      }
    }
  })
}
