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

export const run = (onStdout)(onStderr)(ffmpeg) => {
  const context = this
	const args = compileFFmpeg(ffmpeg)

	const process = spawn(ffmpeg.path, args)

  process.stdout.setEncoding('utf8'))
  process.stdout.on('data', function (data) {
    onStdout.call(context, data)
  });

  process.stderr.setEncoding('utf8'
  process.stderr.on('data', function (data) {
    onStderr.call(context, data)
  });

  process.on('exit', function (code) {
    console.log('exit with code ', code)
  });
}

export default createFFmpeg