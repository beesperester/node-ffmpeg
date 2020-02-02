// Node related imports
import fs from 'fs'
import S from 'sanctuary'

// App related imports
import { libffmpeg } from '../ffmpeg'
import { compileFFmpeg } from '../ffmpeg/ffmpeg'

export const command = 'concat <input>'

export const describe = ''

export const builder = (yargs) => {
	yargs
		.positional('input', {
			describe: 'path to input video',
			type: 'string'
		})
}

export const handler = (argv) => {
	
}

export default {
	command,
	describe,
	builder,
	handler
}