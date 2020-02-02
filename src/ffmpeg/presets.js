import S from 'sanctuary'

import * as libcmdli from '../cmdli'
import * as libffmpeg from './ffmpeg'

// ffmpeg presets
// video filter presets
export const fisheye = (ihvof) => (ivof) => (istereo) => (oprojection) => (ohfov) => (ovfov) => (ostereo) => (width) => (height) => libcmdli.createArgument('-vf')()(`v360=fisheye:${oprojection}:ih_fov=${ihvof}:iv_fov=${ivof}:h_fov=${ohfov}:v_fov=${ovfov}:in_stereo=${istereo}:out_stereo=${ostereo}:w=${width}:h=${height}`)

export const stereoVr180x180to2d = fisheye(180)(180)('sbs')('flat')(120)(90)('2d')

// ffprobe presets
export const duration = S.pipe([
  S.chain(
    S.encase(
			libcmdli.setArgument(
        libffmpeg.ffprobeArguments.showEntries('format=duraction')
			)
		)
  ),
  S.chain(
    S.encase(
      libcmdli.setArgument(
        libffmpeg.ffprobeArguments.verbosity('quiet')
      )
    )
  )
])

export default {
  ffmpeg: {
    vf: {
      fisheye,
      stereoVr180x180to2d
    }
  },

  ffprobe: {
    duration
  }
}