import fs from 'fs'
import S from 'sanctuary'

import * as libffmpeg from '../ffmpeg'

export const command = 'gif <input> [s,e,t] <output>'

export const describe = ''

export const builder = (yargs) => {
	yargs
		.positional('input', {
			describe: 'path to input video',
			type: 'string'
		})
		.positional('output', {
			describe: 'path to output gif',
			type: 'string'
		})
		.options({
			s: {
				alias: 'seek',
				describe: 'start time from the beginning of the video in seconds',
				type: 'number'
			},
			e: {
				alias: 'seek_eof',
				describe: 'start time but from the end of the video in seconds'
			},
			t: {
				alias: 'duration',
				default: 5,
				describe: 'duration of gif in seconds',
				type: 'number'
			},
			w: {
				alias: 'width',
				default: 320,
				describe: 'width of gif',
				type: 'number'
			}
		})
}

const fileExists = (file) => {
	return fs.existsSync(file) ? S.Right(file) : S.Left(new Error(`Missing file at ${file}`))
}

const noop = (x) => x

const prepareInput = (argv) => S.pipe([
	fileExists,
	S.map(libffmpeg.createInput),
	argv.seek ? S.map(libffmpeg.addArgument(libffmpeg.inputArguments.createSeekArgument(argv.seek))) : noop,
	argv.seek_eof ? S.map(libffmpeg.addArgument(libffmpeg.inputArguments.createSeekEofArgument(argv.seek_eof))) : noop,
	argv.duration ? S.map(libffmpeg.addArgument(libffmpeg.inputArguments.createDurationArgument(argv.duration))) : noop
])

const filterComplexArgument = (width) => libffmpeg.ffmpegArguments.createFilterComplexArgument(`[0:v] fps=12,scale=w=${width}:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1`)

const prepareFFmpeg = (argv) => (input) => S.pipe([
	libffmpeg.setArgument(libffmpeg.ffmpegArguments.createOverrideArgument()),
	libffmpeg.addInput(input),
	libffmpeg.setArgument(filterComplexArgument(argv.width)),
	libffmpeg.setOutput(argv.output)
])

export const handler = (argv) => {
	const input = prepareInput(argv)(argv.input)

	if (S.isRight(input)) {
		const ffmpeg = libffmpeg.createFFmpeg()

		const createGif = prepareFFmpeg(argv)(input.value)(ffmpeg)

		libffmpeg.run((data) => {
			console.log('stdout: ' + data);
		})((data) => {
			if (data.startsWith('frame=')) {
				console.log(data);
			}
		})((code) => {
			console.log('child process exited with code ' + code);
		})(createGif)
	}
}

export default {
	command,
	describe,
	builder,
	handler
}