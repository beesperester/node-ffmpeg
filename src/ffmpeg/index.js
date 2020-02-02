import * as libcmdli from '../cmdli'

export const createFFmpeg = () => libcmdli.createCMD('ffmpeg')

export const createFFprobe = () => libcmdli.createCMD('ffprobe')

export const ffmpegArguments = {
  input: libcmdli.createArgument('-i')(),

  seek: libcmdli.createArgument('-ss')(),

  seekeof: libcmdli.createArgument('-sseof')(),

  duration: libcmdli.createArgument('-t')(),

  override: libcmdli.createArgument('-y')(),

  filter: libcmdli.createArgument('-f')(),

  safe: libcmdli.createArgument('-safe')(),

  strict: libcmdli.createArgument('-strict')(),

  verbosity: libcmdli.createArgument('-v')(),

  videoFilter: libcmdli.createArgument('-vf')([
    libcmdli.createConstraint('-filter_complex')(libcmdli.constraintFlags.mustNotExist)
  ]),

  filterComplex: libcmdli.createArgument('-filter_complex')([
    libcmdli.createConstraint('-vf')(libcmdli.constraintFlags.mustNotExist)
  ])
}

export const ffprobeArguments = {
  outputFormat: libcmdli.createArgument('-of')(),

  verbosity: libcmdli.createArgument('-v')(),

  showEntries: libcmdli.createArgument('-show_entries')()
}