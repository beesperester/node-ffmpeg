// Node related imports
import { spawnSync } from 'child_process'

// Cmdli related imports
import * as utilities from './utilities'

export const createCMD = path => {
  return {
    path: path,
    arguments: [],
    result: createResult('')('')
  }
}

export const setResult = result => cmd => {
  utilities.assertType(createResult())(result)

  utilities.assertType(createCMD())(cmd)

  return {
    ...cmd,
    result
  }
}

export const addArgument = argument => cmd => {
  utilities.assertType(createCMD())(cmd)

  return {
    ...cmd,
    arguments: [...cmd.arguments, argument]
  }
}

export const setArgument = argument => cmd => {
  utilities.assertType(createCMD())(cmd)

  const filteredArguments = cmd.arguments.filter(x => {
    return x.argument !== argument.argument
  })

  return {
    ...cmd,
    arguments: [...filteredArguments, argument]
  }
}

export const constraintFlags = {
  mustExist: Symbol('mustExist'),
  mustNotExist: Symbol('mustNotExist')
}

export const createConstraint = argument => flag => {
  return {
    argument,
    flag
  }
}

export const createResult = stdout => stderr => {
  return {
    stdout,
    stderr
  }
}

export const createArgument = argument => constraints => value => {
  return {
    argument,
    value: value ? value.toString() : undefined,
    constraints: constraints || []
  }
}

export const compileArgument = argument => {
  return [argument.argument, argument.value].filter(utilities.filterEmpty)
}

export const compileCMD = cmd => {
  // assert constraints for all arguments
  cmd.arguments.forEach(argument => {
    utilities.assertConstraints(argument)(cmd)
  })

  return cmd.arguments.map(compileArgument).reduce(utilities.reduceArray, [])
}

export const run = cmd => {
  const args = compileCMD(cmd)

  console.log(args.join(' '))

  const { stdout, stderr } = spawnSync(cmd.path, args)

  const result = createResult(stdout.toString('utf8'))(stderr.toString('utf8'))

  return setResult(result)(cmd)
}
