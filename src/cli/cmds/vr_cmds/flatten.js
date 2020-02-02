import S from 'sanctuary'

import { setArgument, run } from '../../../cmdli'
import {
	createFFmpeg,
	ffmpegArguments,
	stereoVr180x180to2d
} from '../../../ffmpeg'

export const command = 'flatten <input> <output> [s,e,t,w,h,y]'

export const desc = 'Flatten stereo vr video'

export const builder = (yargs) => {
	return yargs
		.positional('input', {
			describe: 'path to input video',
			type: 'string'
		})
		.positional('output', {
			describe: 'path to output video',
			type: 'string'
		})
		.options({
			s: {
				alias: 'seek',
				describe: 'start time from the beginning of the video in seconds',
				type: 'number'
			},
			e: {
				alias: 'seekeof',
				describe: 'start time but from the end of the video in seconds'
			},
			t: {
				alias: 'duration',
				describe: 'duration of gif in seconds',
				type: 'number'
			},
			w: {
				alias: 'width',
				default: 1920,
				describe: 'width of output',
				type: 'number'
			},
			h: {
				alias: 'height',
				default: 1080,
				describe: 'height of output',
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

export const flattenStereoVR = (config) => {
	const ffmpeg = S.Right(createFFmpeg())

	const result = S.pipe([
		config.seek
			? S.chain(
				S.encase(
					setArgument(ffmpegArguments.seek(config.seek))
				)
			)
			: noop,
		config.seekeof
			? S.chain(
				S.encase(
					setArgument(ffmpegArguments.seekeof(config.seekeof))
				)
			)
			: noop,
		config.duration
			? S.chain(
				S.encase(
					setArgument(ffmpegArguments.duration(config.duration))
				)
			)
			: noop,
		S.chain(
			S.encase(
				setArgument(ffmpegArguments.input(config.input))
			)
		),
		stereoVr180x180to2d(config.width)(config.height),
		config.override
			? S.chain(
				S.encase(
					setArgument(ffmpegArguments.override())
				)
			)
			: noop,
		S.chain(
			S.encase(
				setArgument(ffmpegArguments.output(config.output))
			)
		),
		S.chain(
			S.encase(
				run
			)
		)
	])(ffmpeg)

	if (S.isRight(result)) {
		const { stdout, stderr } = result.value.result

		console.log(stdout, stderr)
	}

	throw result.value
}

export const handler = function (argv) {
	flattenStereoVR(argv)
}