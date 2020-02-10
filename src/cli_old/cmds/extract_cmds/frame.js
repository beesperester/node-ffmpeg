import path from 'path'
import S from 'sanctuary'
import { createArgument, setArgument, run } from '../../../cmdli'
import { createFFmpeg, ffmpegArguments } from '../../../ffmpeg'
import { getDuration } from '../probe_cmds/duration'
import { baseSetup } from '../../presets'

export const command = 'frame <input>'

export const desc = 'Get video frame'

export const builder = (yargs) => {
  return yargs.positional('input', {
    describe: 'path to input video',
    type: 'string'
  })
    .options({
      n: {
        alias: 'number',
        describe: 'number of clips',
        default: 20,
        type: 'number'
      }
    })
}

export const handler = function (argv) {
  const duration = getDuration(argv.input)

  const dirname = path.dirname(argv.input)
  const basename = path.basename(argv.input)
  const extension = path.extname(argv.input)
  const filename = basename.replace(extension, '')

  for (let i = 0; i < argv.number; i++) {
    const clipStart = (duration / argv.number * i) + 1

    const output = path.join(dirname, `${filename}.${String(i + 1).padStart(4, '0')}.jpg`)

    const pipe = S.pipe([
      S.chain(
        S.encase(
          setArgument(createArgument('-accurate_seek')()())
        )
      ),

      baseSetup({
        input: argv.input,
        seek: clipStart
      }),

      S.chain(
        S.encase(
          setArgument(createArgument('-frames:v')()(1))
        )
      ),

      S.chain(
        S.encase(
          setArgument(ffmpegArguments.output(output))
        )
      ),

      S.chain(
        S.encase(
          run
        )
      )
    ])(S.Right(createFFmpeg()))

    if (S.isRight(pipe)) {
      console.log('done', output)
    }
  }
}
