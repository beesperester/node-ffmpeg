import S from 'sanctuary'
import path from 'path'
import fs from 'fs'
import { attempt, fork, getFileComponents, noop } from './utilities'
import { setArgument, addArgument, createArgument, createCMD } from '../cmdli'
import { createFFmpeg, ffmpegArguments, setVideoFilterArgument } from '../ffmpeg'
import { createFFprobe, ffprobeArguments } from '../ffprobe'

export const inputSetup = (config) => S.pipe([
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
      setArgument(
        ffmpegArguments.input(config.input)
      )
    )
  )
])

const stereoVrToMono = (config) => S.pipe([
  (config.stereoVrToMono
    ? S.chain(
      S.encase(
        setVideoFilterArgument(
          ffmpegArguments.videoFilter(
            [
              'v360=equirect',
              'flat',
              'h_fov=120',
              'v_fov=90',
              // 'ih_fov=180',
              // 'iv_fov=180',
              // 'in_stereo=sbs',
              // 'out_stereo=2d',
              'yaw=90',
              'pitch=-10'
              // (config.width
              //   ? `w=${config.width}`
              //   : undefined),
              // (config.height
              //   ? `h=${config.height}`
              //   : undefined)
            ].filter(noop).join(':'))
        )
      )
    )
    : noop)
])

const stereoToMono = (config) => S.pipe([
  (config.stereoToMono
    ? S.chain(
      S.encase(
        setVideoFilterArgument(
          ffmpegArguments.videoFilter([
            'stereo3d=sbsl:ml'
          ].join(':'))
        )
      )
    )
    : noop)
])

export const outputSetup = (config) => S.pipe([
  (config.width && !config.height
    ? S.chain(
      S.encase(
        setVideoFilterArgument(ffmpegArguments.videoFilter(`scale=${config.width}:-1`)
        )
      )
    )
    : noop),

  (!config.width && config.height
    ? S.chain(
      S.encase(
        setVideoFilterArgument(ffmpegArguments.videoFilter(`scale=-1:${config.height}`
        ))
      )
    )
    : noop),

  (config.width && config.height
    ? S.chain(
      S.encase(
        setVideoFilterArgument(ffmpegArguments.videoFilter(`scale=${config.width}:${config.height}`)
        )
      )
    )
    : noop),

  (config.aspectRatio
    ? S.chain(
      S.encase(
        setVideoFilterArgument(ffmpegArguments.videoFilter(`setdar=${config.aspectRatio}`)
        )
      )
    )
    : noop),

  (config.override
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.override())
      )
    )
    : noop),

  (config.output
    ? S.chain(
      S.encase(
        setArgument(ffmpegArguments.output(config.output))
      )
    )
    : noop)
])

export const inputTransform = (config) => S.pipe([
  stereoVrToMono(config),

  stereoToMono(config)
])

export const extractClip = (config) => {
  if (!config.input) throw new Error('Missing input')

  const { dirname, filename, extension } = getFileComponents(config.input)

  const output = path.join(dirname, `${filename}.clip${extension}`)

  const processConfig = {
    output,
    ...config
  }

  console.log(`Extract clip to ${processConfig.output}`)

  const process = S.pipe([
    inputSetup(processConfig),

    inputTransform(processConfig),

    outputSetup(processConfig)
  ])(attempt(createFFmpeg))

  const result = fork(process)

  if (S.isRight(result)) {
    return processConfig.output
  } else {
    throw result.value
  }
}

export const concat = (config) => S.pipe([
  S.chain(
    S.encase(
      setArgument(
        ffmpegArguments.filter('concat')
      )
    )
  ),

  S.chain(
    S.encase(
      setArgument(
        ffmpegArguments.safe('0')
      )
    )
  ),

  S.chain(
    S.encase(
      setArgument(
        ffmpegArguments.input(config.input)
      )
    )
  ),

  S.chain(
    S.encase(
      setArgument(
        createArgument('-c')()('copy')
      )
    )
  )
])

export const concatClips = (clips) => (config) => {
  if (!clips.length > 0) throw new Error('Missing clips')
  if (!config.output) throw new Error('Missing output')

  const { dirname, filename } = getFileComponents(clips[0])

  const list = path.join(dirname, `${filename}.clips.txt`)

  const listData = clips.map((clip) => `file '${clip}'`).join('\n')

  fs.writeFileSync(list, listData)

  const processConfig = {
    ...config,
    input: list
  }

  console.log(`Concat clips to ${processConfig.output}`)

  const process = S.pipe([
    concat(processConfig),

    outputSetup(processConfig)
  ])(attempt(createFFmpeg))

  const result = fork(process)

  if (S.isRight(result)) {
    return processConfig.output
  } else {
    throw result.value
  }
}

export const extractFrame = (config) => {
  if (!config.input) throw new Error('Missing input')

  const { dirname, filename } = getFileComponents(config.input)

  const output = path.join(dirname, `${filename}.frame.jpg`)

  const processConfig = {
    output,
    ...config
  }

  console.log(`Extract frame to ${processConfig.output}`)

  const process = S.pipe([
    S.chain(
      S.encase(
        setArgument(createArgument('-accurate_seek')()())
      )
    ),

    inputSetup(processConfig),

    inputTransform(processConfig),

    outputSetup(processConfig)
  ])(attempt(createFFmpeg))

  const result = fork(process)

  if (S.isRight(result)) {
    return processConfig.output
  } else {
    throw result.value
  }
}

export const extractFrames = (outputDirectory) => (config) => {
  if (!config.input) throw new Error('Missing input')

  const duration = getDuration(config)

  const { filename } = getFileComponents(config.input)

  const frames = []

  console.log(`Extract frames from ${config.input}`)

  for (let i = 0; i < config.number; i++) {
    let clipStart = (duration / config.number * i) + 1

    if (i + 1 === config.number) {
      clipStart = duration - 1
    }

    const output = path.join(outputDirectory, `${filename}.frame.${String(i + 1).padStart(4, '0')}.jpg`)

    const frame = extractFrame({
      ...config,
      seek: clipStart,
      output
    })

    frames.push(frame)
  }

  return frames
}

export const extractClips = (outputDirectory) => (config) => {
  if (!config.input) throw new Error('Missing input')

  const duration = getDuration(config)

  const { filename, extension } = getFileComponents(config.input)

  const clips = []

  console.log(`Extract clips from ${config.input}`)

  for (let i = 0; i < config.number; i++) {
    const clipDuration = config.duration / (config.number - 1)
    let clipStart = (duration / config.number * i) + 1

    if (i + 1 === config.number) {
      clipStart = duration - config.duration
    }

    const output = path.join(outputDirectory, `${filename}.clip.${i + 1}${extension}`)

    const clip = extractClip({
      ...config,
      output,
      seek: clipStart,
      duration: clipDuration
    })

    clips.push(clip)
  }

  return clips
}

export const montageFrames = (frames) => (config) => {
  if (!config.output) throw new Error('Missing output')

  const processConfig = {
    ...config
  }

  console.log(`Montage frames to ${processConfig.output}`)

  const process = S.pipe([
    S.chain(
      S.encase(
        setArgument(createArgument('-mode')()('concatenate'))
      )
    ),

    S.chain(
      S.encase(
        (montage) => {
          frames.forEach((frame) => {
            montage = addArgument(createArgument()()(frame))(montage)
          })

          return montage
        }
      )
    ),

    S.chain(
      S.encase(
        setArgument(createArgument('-tile')()('4x'))
      )
    ),

    S.chain(
      S.encase(
        setArgument(createArgument('-background')()('#000000'))
      )
    ),

    S.chain(
      S.encase(
        setArgument(createArgument('-geometry')()(`${Math.floor(config.width / 4)}x`))
      )
    ),

    S.chain(
      S.encase(
        addArgument(createArgument()()(processConfig.output))
      )
    )
  ])(attempt(() => createCMD('montage')))

  const result = fork(process)

  if (S.isRight(result)) {
    return processConfig.output
  } else {
    throw result.value
  }
}

export const getDuration = (config) => {
  if (!config.input) throw new Error('Missing input')

  console.log(`Get duration of ${config.input}`)

  const process = S.pipe([
    S.chain(
      S.encase(
        setArgument(
          ffprobeArguments.input(config.input)
        )
      )
    ),
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
  ])(attempt(createFFprobe))

  const result = fork(process)

  if (S.isRight(result)) {
    const { stdout } = result.value.result

    return Math.floor(stdout)
  } else {
    throw result.value
  }
}

export default {
  getDuration
}
