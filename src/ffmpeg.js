import { spawn } from 'child_process'

export const createFFmpeg = (path) => {
	return {
		path: path || 'ffmpeg',
		inputs: [],
		arguments: [],
		output: undefined
	}
}

export const createInput = (path) => {
	return {
		path,
		arguments: []
	}
}

export const addInput = (ffmpeg) => (input) => {
	return {
		...ffmpeg,
		inputs: [
			...ffmpeg.inputs,
			input
		]
	};
}

export const setOutput = (ffmpeg) => (output) => {
	return {
		...ffmpeg,
		output
	}
}

export const addFFmpegArgument = (ffmpeg) => (argument) => {
	return {
		...ffmpeg,
		arguments: [
			...ffmpeg.arguments,
			argument
		]
	}
}

export const addInputArgument = (ffmpegInput) => (argument) => {
	return {
		...ffmpegInput,
		arguments: [
			...ffmpegInput.arguments,
			argument
		]
	}
}

export const createArgument = (argument) => (value) => {
	return {
		argument,
		value: `${value}`
	}
}

export const compileArgument = (argument) => {
	return [
		argument.argument,
		argument.value
	]
}

const reduceArray = (previous, current) => {
	return previous.concat(current);
}

export const compileInput = (input) => {
	const inputArguments = input.arguments.map(compileArgument).reduce(reduceArray, [])

	return inputArguments.concat(['-i', `${input.path}`])
}

export const compileFFmpeg = (ffmpeg) => {
	const inputs = ffmpeg.inputs.map(compileInput).reduce(reduceArray, [])
	const ffmpegAguments = ffmpeg.arguments.map(compileArgument).reduce(reduceArray, [])

	return inputs.concat(ffmpegAguments).concat([`${ffmpeg.output}`])
}

export const run = (ffmpeg) => {
	const args = compileFFmpeg(ffmpeg)

	console.log(args)

	return spawn(ffmpeg.path, args)
}

export default createFFmpeg