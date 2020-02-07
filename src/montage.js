import path from 'path'
import S from 'sanctuary'
import { addArgument, createArgument, createCMD, setArgument, run } from './cmdli'

const input = '/Users/bernhardesperester/git/node-ffmpeg/data/Alexis Adams - Nasty Namaste.0001.jpg'
const inputs = []

const dirname = path.dirname(input)
const basename = path.basename(input)
const extension = path.extname(input)
const filename = basename.replace(extension, '')

const sequenceIdentifier = /\.([0-9]+)\.[a-zA-Z0-9]+$/.exec(input)

if (sequenceIdentifier) {
  const sequenceLength = sequenceIdentifier[1].length
  const filenameWithoutSequence = filename.replace(sequenceIdentifier[1], '')
  const output = path.join(dirname, `${filenameWithoutSequence}montage.jpg`)

  for (let i = 0; i < 20; i++) {
    const frame = input.replace(sequenceIdentifier[1], String(i + 1).padStart(sequenceLength, '0'))

    inputs.push(frame)
  }

  const pipe = S.pipe([
    S.map(
      (x) => {
        inputs.forEach((y) => {
          x = addArgument(createArgument()()(y))(x)
        })

        return x
      }
    ),

    S.map(
      setArgument(createArgument('-tile')()('4x5'))
    ),

    S.map(
      setArgument(createArgument('-border')()(0))
    ),

    S.map(
      setArgument(createArgument('-geometry')()('640x'))
    ),

    S.map(
      addArgument(createArgument()()(output))
    ),

    S.chain(
      S.encase(
        run
      )
    )
  ])(S.Right(createCMD('montage')))

  console.log(pipe)
}
