// Node related imports
import fs from 'fs'
import path from 'path'
import S from 'sanctuary'
import temp from 'temp'

temp.track()

import { getDuration } from '../probe_cmds/duration'
import {
	setArgument,
	createArgument,
	run
} from '../../../cmdli'
import {
	createFFmpeg,
	ffmpegArguments,
} from '../../../ffmpeg'

export const command = 'compilation <input> [n,t]'

export const describe = ''

export const builder = (yargs) => {
	return yargs
		.positional('input', {
			describe: 'path to input video',
			type: 'string'
		})
		.options({
			n: {
				alias: 'number',
				describe: 'number of clips',
				default: 10,
				type: 'number'
			},
			t: {
				alias: 'duration',
				describe: 'duration of trailer',
				default: 30,
				type: 'number'
			}
		})
}

export const clip = (config) => S.pipe([
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.seek(config.start)
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.input(config.input)
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.override()
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.duration(config.duration)
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.strict(-2)
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.output(config.output)
			)
		)
	),
	S.chain(
		S.encase(
			run
		)
	)
])

export const concat = (config) => S.pipe([
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.filter('concat')
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.safe('0')
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.input(config.input)
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				createArgument('-c')()('copy')
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.override()
			)
		)
	),
	S.chain(
		S.encase(
			setArgument(
				ffmpegArguments.output(config.output)
			)
		)
	),
	S.chain(
		S.encase(
			run
		)
	)
])

export const handler = (argv) => {
	const duration = getDuration(argv.input)
	const clips = []

	const dirname = path.dirname(argv.input)
	const basename = path.basename(argv.input)
	const extension = path.extname(argv.input)
	const filename = basename.replace(extension, '')

	temp.mkdir(filename, function (err, tempDirectoryPath) {
		if (err) throw err;

		for (let i = 0; i < argv.number; i++) {
			const clipDuration = argv.duration / (argv.number - 1)
			let clipStart = (duration / argv.number * i) + 1

			if (i + 1 == argv.number) {
				clipStart = duration - argv.duration
			}

			const output = path.join(tempDirectoryPath, `clip.${i + 1}${extension}`)

			const ffmpeg = clip({
				start: clipStart,
				duration: clipDuration,
				input: argv.input,
				output
			})(S.Right(createFFmpeg()))

			if (S.isRight(ffmpeg)) {
				clips.push(output)
				console.log('done', output)
			}
		}

		const list = path.join(tempDirectoryPath, 'list.txt')

		const listData = clips.map((clip) => `file '${clip}'`).join('\n')

		fs.writeFile(list, listData, function (err) {
			if (err) throw err;

			const output = path.join(dirname, `${filename}.compilation${extension}`)

			const ffmpeg = concat({
				input: list,
				output
			})(S.Right(createFFmpeg()))

			if (S.isRight(ffmpeg)) {
				const { stdout, stderr } = ffmpeg.value.result

				console.log(stdout, stderr)
				console.log('done', output)
			}
		})
	})
}