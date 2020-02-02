// Node related imports
import fs from 'fs'
import S from 'sanctuary'

// App related imports
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



export const probeDuration = (path) => {
	const input = libffmpeg.ffmpegArguments.createInputArgument(path)

	const ffmpeg = prepareFFmpeg(input)(libffmpeg.createFFmpeg('ffprobe'))

	if (S.isRight(ffmpeg)) {
		return Math.floor(ffmpeg.value.result.stdout)
	}
}

export const handler = (argv) => {
	if (argv.duration) {
		console.log(probeDuration(argv.input))
	}
}

export default {
	command,
	describe,
	builder,
	handler
}