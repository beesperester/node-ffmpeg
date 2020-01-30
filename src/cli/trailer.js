import fs from 'fs'
import S from 'sanctuary'


// FFmpeg related imports
import { libffmpeg } from '../ffmpeg'
import { probeDuration } from './probe'

export const command = 'trailer <input> [n,t]'

export const describe = ''

export const builder = (yargs) => {
	yargs
		.positional('input', {
			describe: 'path to input video',
			type: 'string'
		})
		.options({
			n: {
				alias: 'number',
				describe: 'number of clips',
				default: 5,
				type: 'number'
			},
			t: {
				alias: 'duration',
				describe: 'duration of trailer',
				default: 5,
				type: 'number'
			}
		})
}

const fileExists = (file) => {
	return fs.existsSync(file) ? S.Right(file) : S.Left(new Error(`Missing file at ${file}`))
}

const stripExtension = (file) => {
	const parts = file.split('.')

	const extension = parts.pop()

	return {
		file: parts.join('.'),
		extension: extension
	}
}

const prepareOutput = (path) => (index) => {
	const { file, extension } = stripExtension(path)

	return `${file}.clip.${index}.${extension}`
}

const prepareConcatOutput = (path) => {
	const { file, extension } = stripExtension(path)

	return `${file}.concat.${extension}`
}

const prepareFFmpeg = (input) => (start) => (duration) => (output) => S.pipe([
	S.encase(
		libffmpeg.setArgument(
			libffmpeg.ffmpegArguments.createSeekArgument(start)
		)
	),
	S.chain(
		S.encase(libffmpeg.addArgument(input))
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.ffmpegArguments.createOverrideArgument()
			)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.ffmpegArguments.createDurationArgument(duration)
			)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.createArgument('-strict')()(-2)
			)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setOutput(output)
		)
	),
	// S.chain(
	// 	S.encase(
	// 		libffmpeg.run
	// 	)
	// )
])

const prepareConcatFFmpeg = (input) => (output) => S.pipe([
	S.encase(
		libffmpeg.setArgument(
			libffmpeg.createArgument('-f')()('concat')
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.createArgument('-safe')()('0')
			)
		)
	),
	S.chain(
		S.encase(libffmpeg.addArgument(input))
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.createArgument('-c')()('copy')
			)
		)
	),
	S.chain(
		S.encase(
			libffmpeg.setArgument(
				libffmpeg.ffmpegArguments.createOverrideArgument()
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
	const duration = probeDuration(argv.input)
	const clips = []

	for (let i = 0; i < argv.number; i++) {
		const clipDuration = argv.duration / (argv.number - 1)
		let clipStart = (duration / argv.number * i) + 1

		if (i + 1 == argv.number) {
			clipStart = duration - argv.duration
		}

		const output = prepareOutput(argv.input)(i + 1)

		const input = libffmpeg.ffmpegArguments.createInputArgument(argv.input)

		const ffmpeg = prepareFFmpeg(input)(clipStart)(clipDuration)(output)(libffmpeg.createFFmpeg())

		if (S.isRight(ffmpeg)) {
			clips.push(output)
			console.log('done', output)
		}
	}

	const concatOutput = prepareConcatOutput(argv.input)

	const concatInput = libffmpeg.ffmpegArguments.createInputArgument('/Users/bernhardesperester/git/node-ffmpeg/data/mylist.txt')
	const concatFFmpeg = prepareConcatFFmpeg(concatInput)(concatOutput)(libffmpeg.createFFmpeg())

	if (S.isRight(concatFFmpeg)) {
		const { stdout, stderr } = concatFFmpeg.value.result

		console.log(stdout, stderr)
		console.log('done', concatOutput)
	}
}

export default {
	command,
	describe,
	builder,
	handler
}