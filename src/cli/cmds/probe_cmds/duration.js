import S from 'sanctuary'

import { setArgument, run } from '../../../cmdli'
import {
	createFFprobe,
	ffprobeArguments,
	duration
} from '../../../ffprobe'

export const command = 'duration <input>'

export const desc = 'Get video duration in seconds'

export const builder = (yargs) => {
	return yargs.positional('input', {
		describe: 'path to input video',
		type: 'string'
	})
}

export const getDuration = (input) => {
	const ffprobe = S.Right(createFFprobe())

	const result = S.pipe([
		S.chain(
			S.encase(
				setArgument(ffprobeArguments.input(input))
			)
		),
		duration,
		S.chain(
			S.encase(
				run
			)
		)
	])(ffprobe)

	if (S.isRight(result)) {
		const { stdout, stderr } = result.value.result

		return Math.floor(stdout)
	}

	throw result.value
}

export const handler = function (argv) {
	console.info(getDuration(argv.input))
}