import S from 'sanctuary'

import * as libcmdli from '../cmdli'

export const createFFmpeg = (path) => libcmdli.createCMD(path || 'ffmpeg')

// arguments
export const ffmpegArguments = {
  input: libcmdli.createArgument('-i')(),

  output: libcmdli.createArgument()(),

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

// presets
// video filter presets
export const videoFilter = {
  v360: {
    fisheye: (ihvof) => (ivof) => (istereo) => (oprojection) => (ohfov) => (ovfov) => (ostereo) => (width) => (height) => `v360=fisheye:${oprojection}:ih_fov=${ihvof}:iv_fov=${ivof}:h_fov=${ohfov}:v_fov=${ovfov}:in_stereo=${istereo}:out_stereo=${ostereo}:w=${width}:h=${height}`
  },

  stereo3d: {
    left: () => 'stereo3d=sbsl:ml'
  }
}

// ffmpeg presets
export const stereoVr180x180to2d = (width) => (height) => S.pipe([
  S.chain(
    S.encase(
      libcmdli.setArgument(
        ffmpegArguments.videoFilter(videoFilter.v360.fisheye(180)(180)('sbs')('flat')(120)(90)('2d')(width)(height))
      )
    )
  )
])

export const gif = (width) => S.pipe([
  S.chain(
    S.encase(
      libcmdli.setArgument(
        ffmpegArguments.filterComplex(`[0:v] fps=12,scale=w=${width}:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1`)
      )
    )
  )
])

export const presets = {
  stereoVr180x180to2d,
  gif
}

export default {
  createFFmpeg,
  ffmpegArguments,
  presets
}