import { convertGif } from '../../presets'

export const command = 'gif <input> [number,duration,override,width,height]'

export const describe = ''

export const builder = (yargs) => {
  return yargs
    .positional('input', {
      describe: 'path to input video',
      type: 'string'
    })
    .option('seek', {
      describe: 'start point',
      type: 'string'
    })
    .option('seekeof', {
      describe: 'start point from end of file',
      type: 'string'
    })
    .option('pointOfInterest', {
      describe: 'point of interest',
      type: 'string'
    })
    .option('duration', {
      describe: 'duration of trailer',
      type: 'string'
    })
    .option('override', {
      describe: 'override output',
      default: false,
      type: 'boolean'
    })
    .option('width', {
      describe: 'set output width',
      default: 640,
      type: 'number'
    })
    .option('height', {
      describe: 'set output height',
      default: 360,
      type: 'number'
    })
}

export const handler = (argv) => {
  const gif = convertGif(argv)

  console.log(gif)
}
