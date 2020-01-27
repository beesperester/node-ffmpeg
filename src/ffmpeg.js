import { spawn } from 'child_process'

export const createFFmpeg = (path, inputs, ffmpegArguments, output) => {
	return {
		path: path || 'ffmpeg',
		inputs: inputs || [],
		arguments: ffmpegArguments || [],
		output
	}
}

export const createInput = (path, inputArguments) => {
	return {
		path,
		arguments: inputArguments || []
	}
}

export const addInput = (input) => (ffmpeg) => {
	return {
		...ffmpeg,
		inputs: [
			...ffmpeg.inputs,
			input
		]
	};
}

export const setOutput = (output) => (ffmpeg) => {
	return {
		...ffmpeg,
		output
	}
}

export const addArgument = (argument) => (input) => {
	return {
		...input,
		arguments: [
			...input.arguments,
			argument
		]
	}
}

export const createArgument = (argument) => (value) => {
	return {
		argument,
		value: value ? value.toString() : undefined
	}
}

export const inputArguments = {
  createSeekArgument: createArgument('-ss'),

  createSeekEofArgument: createArgument('-sseof'),
  
  createDurationArgument: createArgument('-t'),
}

export const ffmpegArguments = {
  createOverrideArgument: createArgument('-y'),

  createVideoFilterArgument: createArgument('-vf'),

  createFilterComplexArgument: createArgument('-filter_complex')
}

const filterEmpty = (value) => {
	return value ? value.trim() != '' : false
}

export const compileArgument = (argument) => {
	return [
		argument.argument,
		argument.value
	].filter(filterEmpty)
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

	return spawn(ffmpeg.path, args)
}

export default createFFmpeg