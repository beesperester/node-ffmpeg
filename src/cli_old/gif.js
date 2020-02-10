import fs from 'fs'
import path from 'path'
import S from 'sanctuary'

import { libffmpeg } from '../ffmpeg'

export const command = 'gif <input> [s,e,t]'

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
				describe: 'duration of gif in seconds',
				type: 'number'
			},
			w: {
				alias: 'width',
				default: 320,
				describe: 'width of gif',
				type: 'number'
			},
			y: {
				alias: 'override',
				describe: 'override existing file',
				type: 'boolean'
			}
		})
}

const noop = (x) => x

const filterComplexArgument = (width) => libffmpeg.ffmpegArguments.createFilterComplexArgument(`[0:v] fps=12,scale=w=${width}:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1`)

const prepareFFmpeg = (input) => (argv) => (output) => S.pipe([
	S.encase(
		(ffmpeg) => ffmpeg
	),
	argv.seek
		? S.chain(
			S.encase(
				libffmpeg.setArgument(
					libffmpeg.ffmpegArguments.createSeekArgument(argv.seek)
				)
			)
		) : noop,
	argv.seek_eof
		? S.chain(
			S.encase(
				libffmpeg.setArgument(
					libffmpeg.ffmpegArguments.createSeekEofArgument(argv.seek_eof)
				)
			)
		) : noop,
	S.chain(
		S.encase(libffmpeg.addArgument(input))
	),
	argv.duration
		? S.chain(
			S.encase(
				libffmpeg.setArgument(libffmpeg.ffmpegArguments.createDurationArgument(argv.duration)
				)
			)
		) : noop,
	argv.override
		? S.chain(
			S.encase(
				libffmpeg.setArgument(
					libffmpeg.ffmpegArguments.createOverrideArgument()
				)
			)
		) : noop,
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				filterComplexArgument(argv.width)
			)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setOutput(output)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.run
		)
	)
])

export const handler = (argv) => {
	// const input = prepareInput(argv)(argv.input)

	const dirname = path.dirname(argv.input)
	const basename = path.basename(argv.input)
	const extension = path.extname(argv.input)
	const filename = basename.replace(extension, '')

	const input = libffmpeg.ffmpegArguments.createInputArgument(argv.input)

	const output = path.join(dirname, `${filename}.gif`)

	const ffmpeg = prepareFFmpeg(input)(argv)(output)(libffmpeg.createFFmpeg())

	if (S.isRight(ffmpeg)) {
		const { stdout, stderr } = ffmpeg.value.result

		console.log(stdout, stderr)
	}
}

export default {
	command,
	describe,
	builder,
	handler
}