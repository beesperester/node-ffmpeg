import path from 'path'
import { extractFrames, montageFrames } from '../../presets'
import { getFileComponents } from '../../utilities'
import temp from 'temp'

export const command = 'montage <input>'

export const describe = ''

export const builder = (yargs) => {
  return yargs
    .positional('input', {
      describe: 'path to input video',
      type: 'string'
    })
    .option('number', {
      describe: 'number of clips',
      default: 32,
      type: 'number'
    })
    .option('override', {
      describe: 'override output',
      default: false,
      type: 'boolean'
    })
    .option('stereoToMono', {
      describe: 'convert stereo to mono',
      default: false,
      type: 'boolean'
    })
    .option('stereoVrToMono', {
      describe: 'convert stereo VR to mono',
      default: false,
      type: 'boolean'
    })
    .option('width', {
      describe: 'set output width',
      type: 'number'
    })
    .option('height', {
      describe: 'set output height',
      type: 'number'
    })
    .option('aspectRatio', {
      describe: 'set output aspect ratio',
      type: 'string'
    })
    .option('crop', {
      describe: 'crop output video (in percent)',
      type: 'number'
    })
    .option('cropAspectRatio', {
      describe: 'crop aspect ratio',
      default: '3/2',
      type: 'string'
    })
}

export const handler = (argv) => {
  temp.track()

  const { dirname, filename } = getFileComponents(argv.input)

  temp.mkdir(filename, async function (err, tempDirectoryPath) {
    if (err) throw err

    const frames = await extractFrames(tempDirectoryPath)(argv)

    const output = path.join(dirname, `${filename}.montage.jpg`)

    await montageFrames(frames)({
      ...argv,
      output
    })

    console.log(output)
  })
}
