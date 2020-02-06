import S from 'sanctuary'
import { noop } from './utilities'
import { setArgument } from '../cmdli'
import { ffmpegArguments } from '../ffmpeg'
import { ffprobeArguments } from '../ffprobe'

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

  (config.input
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.input(config.input))
      )
    )
    : noop),

  (config.override
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.override())
      )
    )
    : noop)
])

export const duration = S.pipe([
  S.chain(
    S.encase(
      setArgument(
        ffprobeArguments.showEntries('format=duration')
      )
    )
  ),
  S.chain(
    S.encase(
      setArgument(
        ffprobeArguments.verbosity('quiet')
      )
    )
  ),
  S.chain(
    S.encase(
      setArgument(
        ffprobeArguments.outputFormat('csv=p=0')
      )
    )
  )
])

export const presets = {
  stereoVr180x180to2d,
  gif,
  baseSetup,
  duration
}

export default presets
