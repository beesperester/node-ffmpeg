import path from 'path'
import { extractClips, concatClips } from '../../presets'
import { getFileComponents } from '../../utilities'
import temp from 'temp'

export const command = 'compilation <input> [number,duration,override,stereoToMono,width,height]'

export const describe = ''

export const builder = (yargs) => {
  return yargs
    .positional('input', {
      describe: 'path to input video',
      type: 'string'
    })
    .option('number', {
      describe: 'number of clips',
      default: 30,
      type: 'number'
    })
    .option('duration', {
      describe: 'duration of trailer',
      default: 30,
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
}

export const handler = (argv) => {
  temp.track()

  const { dirname, filename, extension } = getFileComponents(argv.input)

  temp.mkdir(filename, function (err, tempDirectoryPath) {
    if (err) throw err

    const clips = extractClips(tempDirectoryPath)(argv)

    const output = path.join(dirname, `${filename}.compilation${extension}`)

    concatClips(clips)({
      output,
      override: argv.override
    })

    console.log(output)
  })
}
