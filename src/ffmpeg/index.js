import { constraintFlags, createArgument, createCMD, createConstraint, setArgument } from '../cmdli'

export const createFFmpeg = (path) => createCMD(path || 'ffmpeg')

// arguments
export const ffmpegArguments = {
  input: createArgument('-i')(),

  output: createArgument()(),

  seek: createArgument('-ss')(),

  seekeof: createArgument('-sseof')(),

  duration: createArgument('-t')(),

  override: createArgument('-y')(),

  filter: createArgument('-f')(),

  safe: createArgument('-safe')(),

  strict: createArgument('-strict')(),

  verbosity: createArgument('-v')(),

  videoFilter: createArgument('-vf')([
    createConstraint('-filter_complex')(constraintFlags.mustNotExist)
  ]),

  filterComplex: createArgument('-filter_complex')([
    createConstraint('-vf')(constraintFlags.mustNotExist)
  ])
}

export const setVideoFilterArgument = (videoFilterArgument) => (ffmpeg) => {
  const videoFilterArguments = [
    ...ffmpeg.arguments.filter((argument) => argument.argument === '-vf'),
    videoFilterArgument
  ]

  if (videoFilterArguments.length > 0) {
    const argumentString = videoFilterArguments.map((argument) => argument.value).join(',')

    return setArgument(ffmpegArguments.videoFilter(argumentString))(ffmpeg)
  } else {
    return setArgument(videoFilterArgument)(ffmpeg)
  }
}

export default {
  createFFmpeg,
  ffmpegArguments
}
