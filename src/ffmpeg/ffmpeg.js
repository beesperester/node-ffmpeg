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
		arguments: [],
		output: undefined,
		result: {
			stdout: '',
			stderr: ''
		}
	}
}

export const setOutput = (output) => (ffmpeg) => {
	assert(output)

	utilities.assertType(createFFmpeg())(ffmpeg)

	return {
		...ffmpeg,
		output
	}
}

export const setResult = (result) => (ffmpeg) => {
	utilities.assertType(createResult())(result)

	utilities.assertType(createFFmpeg())(ffmpeg)

	return {
		...ffmpeg,
		result
	}
}

export const addArgument = (argument) => (ffmpeg) => {
	utilities.assertType(createFFmpeg())(ffmpeg)

	utilities.assertConstraints(argument)(ffmpeg)

	return {
		...ffmpeg,
		arguments: [
			...ffmpeg.arguments,
			argument
		]
	}
}

export const setArgument = (argument) => (ffmpeg) => {
	utilities.assertType(createFFmpeg())(ffmpeg)

	utilities.assertConstraints(argument)(ffmpeg)

	const filteredArguments = ffmpeg.arguments.filter((x) => {
		return x.argument != argument.argument
	})

	return {
		...ffmpeg,
		arguments: [
			...filteredArguments,
			argument
		]
	}
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

export const createResult = (stdout) => (stderr) => {
	return {
		stdout,
		stderr
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

export const ffmpegArguments = {
	createInputArgument: createArgument('-i')(),

	createOverrideArgument: createArgument('-y')(),

	createVideoFilterArgument: createArgument('-vf')(),

	createFilterComplexArgument: createArgument('-filter_complex')
		([
			createConstraint('-vf')(constraintFlags.mustNotExist)
		]),

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

export const compileArgument = (argument) => {
	return [
		argument.argument,
		argument.value
	].filter(utilities.filterEmpty)
}

export const compileFFmpeg = (ffmpeg) => {
	let ffmpegAguments = ffmpeg.arguments.map(compileArgument).reduce(utilities.reduceArray, [])

	if (ffmpeg.output) {
		ffmpegAguments = ffmpegAguments.concat([`${ffmpeg.output}`])
	}

	return ffmpegAguments
}

export const run = (ffmpeg) => {
	const args = compileFFmpeg(ffmpeg)

	const { stdout, stderr } = spawnSync(ffmpeg.path, args)

	const result = createResult
		(stdout.toString('utf8'))
		(stderr.toString('utf8'))

	return setResult(result)(ffmpeg)
}