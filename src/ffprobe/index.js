import * as libcmdli from '../cmdli'

export const createFFprobe = (path) => libcmdli.createCMD(path || 'ffprobe')

// arguments
export const ffprobeArguments = {
  input: libcmdli.createArgument('-i')(),

  outputFormat: libcmdli.createArgument('-of')(),

  verbosity: libcmdli.createArgument('-v')(),

  showEntries: libcmdli.createArgument('-show_entries')()
}

export default {
  createFFprobe,
  ffprobeArguments
}
