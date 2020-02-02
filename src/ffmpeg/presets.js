import S from 'sanctuary'

import * as libcmdli from '../cmdli'
import * as libffmpeg from '../ffmpeg'

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
        libffmpeg.ffmpegArguments.videoFilter(videoFilter.v360.fisheye(180)(180)('sbs')('flat')(120)(90)('2d')(width)(height))
      )
    )
  )
])

export const gif = (width) => S.pipe([
  S.chain(
    S.encase(
      libcmdli.setArgument(
        libffmpeg.ffmpegArguments.filterComplex(`[0:v] fps=12,scale=w=${width}:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1`)
      )
    )
  )
])

// ffprobe presets
export const duration = S.pipe([
  S.chain(
    S.encase(
			libcmdli.setArgument(
        libffmpeg.ffprobeArguments.showEntries('format=duration')
			)
		)
  ),
  S.chain(
    S.encase(
      libcmdli.setArgument(
        libffmpeg.ffprobeArguments.verbosity('quiet')
      )
    )
  ),
  S.chain(
    S.encase(
      libcmdli.setArgument(
        libffmpeg.ffprobeArguments.outputFormat('csv=p=0')
      )
    )
  )
])

export default {
  videoFilter,

  ffmpeg: {
    stereoVr180x180to2d,
    gif
  },

  ffprobe: {
    duration
  }
}