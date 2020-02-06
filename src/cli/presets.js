import S from 'sanctuary'
import { noop } from 'utlities'
import { setArgument } from '../cmdli'
import { ffmpegArguments } from '../ffmpeg'

// ffmpeg presets
const stereoVr180x180to2d = (width) => (height) => S.pipe([
  S.chain(
    S.encase(
      setArgument(
        ffmpegArguments.videoFilter(
          [
            'v360=equirect',
            'flat',
            'ih_fov=180',
            'iv_fov=180',
            'yaw=90',
            'pitch=-10',
            `w=${width}`,
            `h=${height}`
          ].join(':'))
      )
    )
  )
])

export const gif = (width) => S.pipe([
  S.chain(
    S.encase(
      setArgument(
        ffmpegArguments.filterComplex(`[0:v] fps=12,scale=w=${width}:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1`)
      )
    )
  )
])

export const baseSetup = (config) => S.pipe([
  (config.seek
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.seek(config.seek))
      )
    )
    : noop),

  (config.seekeof
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.seekeof(config.seekeof))
      )
    )
    : noop),

  (config.duration
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.duration(config.duration))
      )
    )
    : noop),

  S.chain(
    S.encase(
      setArgument(ffmpegArguments.input(config.input))
    )
  ),

  (config.override
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.override())
      )
    )
    : noop)
])

export const presets = {
  stereoVr180x180to2d,
  gif
}

export default presets
