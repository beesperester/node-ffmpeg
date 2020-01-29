import fs from 'fs'
import S from 'sanctuary'

import { libffmpeg } from '../ffmpeg'
import { compileFFmpeg } from '../ffmpeg/ffmpeg'

export const command = 'probe <input> [t]'

export const describe = ''

export const builder = (yargs) => {
	yargs
		.positional('input', {
			describe: 'path to input video',
			type: 'string'
		})
		.options({
			t: {
				alias: 'duration',
				describe: 'duration of video in seconds',
				type: 'boolean'
			}
		})
}

const fileExists = (file) => {
	return fs.existsSync(file) ? S.Right(file) : S.Left(new Error(`Missing file at ${file}`))
}

const prepareInput = S.pipe([
	fileExists,
	S.map(libffmpeg.createInput)
])

const ffmpegPath = 'ffprobe'

const prepareFFmpeg = S.pipe([
	S.chain(S.encase((input) => {
		const ffmpeg = libffmpeg.createFFmpeg(ffmpegPath)

		return libffmpeg.addInput(input)(ffmpeg)
	})),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.createArgument('-show_entries')()('format=duration')
			)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.createArgument('-v')()('quiet')
			)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.createArgument('-of')()('csv=p=0')
			)
		)
	)
])

export const probeDuration = (path) => {
	const input = prepareInput(path)

	const ffmpeg = prepareFFmpeg(input)

	if (S.isRight(ffmpeg)) {
		const { stdout } = libffmpeg.run(ffmpeg.value)

		return Math.floor(stdout)
	}
}

export const handler = (argv) => {
	if (argv.duration) {
		const input = prepareInput(argv)(argv.input)

		const ffmpeg = prepareFFmpeg(argv)(input)

		if (S.isRight(ffmpeg)) {
			libffmpeg.run((data) => {
				console.log(Math.floor(data));
			})((data) => {
				// console.log(data);
			})((code) => {
				// console.log('child process exited with code ' + code);
			})(ffmpeg.value)
		}
	}
}

export default {
	command,
	describe,
	builder,
	handler
}