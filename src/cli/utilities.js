import S from 'sanctuary'
import { run } from '../cmdli'
import path from 'path'

export const noop = (x) => x

export const attempt = (f) => {
  const context = this
  try {
    return S.Right(f.call(context))
  } catch (exception) {
    return S.Left(new Error('Unable to attempt function call'))
  }
}

export const fork = S.pipe([
  S.chain(
    S.encase(
      run
    )
  )
])

export const getFileComponents = (file) => {
  const dirname = path.dirname(file) // /path/to/file
  const basename = path.basename(file) // filename.txt
  const extension = path.extname(file) // .txt
  const filename = basename.replace(extension, '') // filename

  return {
    dirname,
    basename,
    extension,
    filename
  }
}
