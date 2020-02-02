import S from 'sanctuary'

import * as libcmdli from '../cmdli'

export const fisheye = (ihvof) => (ivof) => (istereo) => (oprojection) => (ohvof) => (ovfof) => (ostereo) => (width) => (height) => libcmdli.createArgument('-vf')()(`v360=fisheye:${oprojection}:ih_fov=${ihvof}:iv_fov=${ivof}:h_fov=${ohvof}:v_fov=${ovfov}:in_i=${istereo}:out_stereo=${ostereo}:w=${width}:h=${height}`)

export const stereoVr180x180to2d = fisheye(180)(180)('sbs')('flat')(120)(90)('2d')