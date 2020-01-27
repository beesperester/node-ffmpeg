#!/usr/local/bin/node

import path from 'path'
import S from 'sanctuary'
import yargs from 'yargs'

import {
	createFFmpeg,
	createInput,
	createArgument,
	addInputArgument,
	addFFmpegArgument,
	compileInput,
	addInput,
	compileFFmpeg,
	setOutput,
	run
} from './src/ffmpeg'

const argv = yargs
	.command('extract <input> <output>', 'convert video to gif', (yargs) => {
		yargs
			.positional('input', {
				describe: 'path to input video',
				type: 'string'
			})
			.options({
				's': {
					alias: 'seek',
					describe: 'start time from the beginning of the video in seconds',
					type: 'number'
				},
				'e': {
					alias: 'seek_eof',
					describe: 'start time but from the end of the video in seconds'
				},
				't': {
					alias: 'duration',
					default: 5,
					describe: 'duration of gif in seconds',
					type: 'number'
				}
			})
			.positional('output', {
				describe: 'path to output gif',
				type: 'string'
			})
	})
	.demandCommand(1, 'You need at least one command before moving on')
	.demandOption(['input', 'output'], 'Please provide necessary arguments')
	.help()
	.argv

let ffmpeg = createFFmpeg()
let ffmpegInput = createInput(argv.input)

const argumentOverride = createArgument('-y')()
const argumentFilter = createArgument('-filter_complex')('[0:v] fps=12,scale=w=480:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1')

const noop = (x) => x

const prepareVideoInput = S.pipe([
	argv.seek ? addInputArgument(createArgument('-ss')(argv.seek)) : noop,
	argv.seek_eof ? addInputArgument(createArgument('-sseof')(argv.seek_eof)) : noop,
	addInputArgument(createArgument('-t')(argv.duration))
])

const videoToGif = S.pipe([
	addInput(prepareVideoInput(ffmpegInput)),
	addFFmpegArgument(argumentOverride),
	addFFmpegArgument(argumentFilter),
	setOutput(argv.output),
	run
])

const process = videoToGif(ffmpeg)

process.stderr.setEncoding('utf8')

process.stdout.on('data', function (data) {
	console.log('stdout: ' + data);
});

process.stderr.on('data', function (data) {
	if (data.startsWith('frame=')) {
		console.log(data);
	}
});

process.on('exit', function (code) {
	console.log('child process exited with code ' + code);
});