#!/usr/local/bin/node

import path from 'path'

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

const input = 'data/Alexis Adams - Nasty Namaste.mp4'
const output = 'data/Alexis Adams - Nasty Namaste.gif'

let ffmpeg = createFFmpeg()
let ffmpegInput = createInput(path.join(__dirname, input))

const argumentSeek = createArgument('-ss')(60)
const argumentDuration = createArgument('-t')(5)
const argumentFilter = createArgument('-filter_complex')('[0:v] fps=12,scale=w=480:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1')

ffmpegInput = addInputArgument(ffmpegInput)(argumentSeek)
ffmpegInput = addInputArgument(ffmpegInput)(argumentDuration)

ffmpeg = addInput(ffmpeg)(ffmpegInput)
ffmpeg = addFFmpegArgument(ffmpeg)(argumentFilter)
ffmpeg = setOutput(ffmpeg)(path.join(__dirname, output))

const process = run(ffmpeg)

process.stdout.on('data', function (data) {
	console.log('stdout: ' + data);
});

process.stderr.on('data', function (data) {
	console.log('stderr: ' + data);
});

process.on('exit', function (code) {
	console.log('child process exited with code ' + code);
});