import path from 'path'
import { convertGif } from '../../presets'
import { getFileComponents } from '../../utilities'
import temp from 'temp'

export const command = 'gif <input> [number,duration,override,width,height]'

export const describe = ''

export const builder = (yargs) => {
  return yargs
    .positional('input', {
      describe: 'path to input video',
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
