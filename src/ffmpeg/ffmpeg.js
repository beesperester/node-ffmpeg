// Node related imports
import fs from 'fs'
import { spawnSync } from 'child_process'
import assert from 'assert'

// FFmpeg related imports
import * as utilities from './utilities'
import {
	FFmpegInputError,
	FFmpegArgumentError,
	FFmpegConstraintError
} from './errors'

export const createFFmpeg = (path) => {
	return {
		path: path || 'ffmpeg',
		inputs: [],
		arguments: [],
		output: undefined
	}
}

export const createInput = (path, inputArguments) => {
	return {
		path,
		arguments: inputArguments || []
	}
}

export const addInput = (input) => (ffmpeg) => {
	utilities.assertType(createInput())(input)

	utilities.assertType(createFFmpeg())(ffmpeg)

	return {
		...ffmpeg,
		inputs: [
			...ffmpeg.inputs,
			input
		]
	};
}

export const setOutput = (output) => (ffmpeg) => {
	assert(output)

	utilities.assertType(createFFmpeg())(ffmpeg)

	return {
		...ffmpeg,
		output
	}
}

export const addArgument = (argument) => (input) => {
	utilities.assertConstraints(argument)(input)

	return {
		...input,
		arguments: [
			...input.arguments,
			argument
		]
	}
}

export const addFFmpegArgument = (argument) => (ffmpeg) => {
	utilities.assertType(createFFmpeg())(ffmpeg)

	return addArgument(argument)(ffmpeg)
}

export const addInputArgument = (argument) => (input) => {
	utilities.assertType(createInput())(input)

	return addArgument(argument)(input)
}

export const setArgument = (argument) => (input) => {
	utilities.assertConstraints(argument)(input)

	const filteredArguments = input.arguments.filter((input) => {
		return input.argument != argument.argument
	})

	return {
		...input,
		arguments: [
			...filteredArguments,
			argument
		]
	}
}

export const setFFmpegArgument = (argument) => (ffmpeg) => {
	utilities.assertType(createFFmpeg())(ffmpeg)

	return setArgument(argument)(ffmpeg)
}

export const setInputArgument = (argument) => (input) => {
	utilities.assertType(createInput())(input)

	return setArgument(argument)(input)
}

export const constraintFlags = {
	mustExist: Symbol('mustExist'),
	mustNotExist: Symbol('mustNotExist')
}

export const createConstraint = (argument) => (flag) => {
	return {
		argument,
		flag
	}
}

export const createArgument = (argument) => (constraints) => (value) => {
	if (!argument) {
		throw new FFmpegArgumentError('Argument must not be empty')
	}

	return {
		argument,
		value: value ? value.toString() : undefined,
		constraints: constraints || []
	}
}

export const inputArguments = {
	createSeekArgument: createArgument('-ss')
		([
			createConstraint('-sseof')(constraintFlags.mustNotExist)
		]),

	createSeekEofArgument: createArgument('-sseof')
		([
			createConstraint('-ss')(constraintFlags.mustNotExist)
		]),

	createDurationArgument: createArgument('-t')(),
}

export const ffmpegArguments = {
	createOverrideArgument: createArgument('-y')(),

	createVideoFilterArgument: createArgument('-vf')(),

	createFilterComplexArgument: createArgument('-filter_complex')
		([
			createConstraint('-vf')(constraintFlags.mustNotExist)
		])
}

export const compileArgument = (argument) => {
	return [
		argument.argument,
		argument.value
	].filter(utilities.filterEmpty)
}

export const compileInput = (input) => {
	const inputArguments = input.arguments.map(compileArgument).reduce(utilities.reduceArray, [])

	return inputArguments.concat(['-i', `${input.path}`])
}

export const compileFFmpeg = (ffmpeg) => {
	const inputs = ffmpeg.inputs.map(compileInput).reduce(utilities.reduceArray, [])
	const ffmpegAguments = ffmpeg.arguments.map(compileArgument).reduce(utilities.reduceArray, [])

	let cmdArguments = inputs.concat(ffmpegAguments)

	if (ffmpeg.output) {
		cmdArguments = cmdArguments.concat([`${ffmpeg.output}`])
	}

	return cmdArguments
}

export const run = (ffmpeg) => {
	const args = compileFFmpeg(ffmpeg)

	const { stdout, stderr } = spawnSync(ffmpeg.path, args)

	return {
		stdout: stdout.toString('utf8'),
		stderr: stderr.toString('utf8')
	}
}