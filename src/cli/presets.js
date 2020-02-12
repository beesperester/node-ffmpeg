import S from 'sanctuary'
import path from 'path'
import fs from 'fs'
import { attempt, fork, getFileComponents, noop, parseTime, createPointOfTime, mergePointsOfTime } from './utilities'
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
          ffmpegArguments.videoFilter('stereo3d=sbsl:ml')
        )
      )
    )
    : noop)
])

const calcAspectRatio = (ratio) => {
  const [a, b] = ratio.split('/').map(parseFloat)

  return a / b
}

const crop = ({ crop, cropAspectRatio } = { cropAspectRatio: '3/2' }) => S.pipe([
  (crop
    ? S.chain(
      S.encase(
        setVideoFilterArgument(
          ffmpegArguments.videoFilter(`crop=iw*${crop}:ih*${crop * 1 / calcAspectRatio(cropAspectRatio)}`)
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

  stereoToMono(config),

  crop(config)
])

export const convertGif = (config) => {
  if (!config.input) throw new Error('Missing input')

  const configPrepared = prepareConfig(config)

  const { dirname, filename } = getFileComponents(configPrepared.input)

  const output = path.join(dirname, `${filename}.gif`)

  const processConfig = {
    output,
    ...configPrepared
  }

  delete processConfig.width
  delete processConfig.height

  if (config.pointOfInterest && processConfig.duration) {
    processConfig.seek = Math.round((parseTime(config.pointOfInterest) - (processConfig.duration * 0.25)) * 10) / 10
  }

  console.log(`Extract gif to ${processConfig.output}`)

  const process = S.pipe([
    inputSetup(processConfig),

    S.chain(
      S.encase(
        setArgument(
          ffmpegArguments.filterComplex(`[0:v] fps=12,scale=w=${configPrepared.width}:h=-1,split [a][b];[a] palettegen [p];[b][p] paletteuse`)
        )
      )
    ),

    outputSetup(processConfig)
  ])(attempt(createFFmpeg))

  const result = fork(process)

  if (S.isRight(result)) {
    return processConfig.output
  } else {
    throw result.value
  }
}

export const extractClip = (config) => {
  if (!config.input) throw new Error('Missing input')

  const configPrepared = prepareConfig(config)

  const { dirname, filename, extension } = getFileComponents(configPrepared.input)

  const output = path.join(dirname, `${filename}.clip${extension}`)

  const processConfig = {
    output,
    ...configPrepared
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

  const configPrepared = prepareConfig(config)

  const { dirname, filename } = getFileComponents(clips[0])

  const list = path.join(dirname, `${filename}.clips.txt`)

  const listData = clips.map((clip) => `file '${clip}'`).join('\n')

  fs.writeFileSync(list, listData)

  const processConfig = {
    ...configPrepared,
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

  const configPrepared = prepareConfig(config)

  const { dirname, filename } = getFileComponents(configPrepared.input)

  const output = path.join(dirname, `${filename}.frame.jpg`)

  const processConfig = {
    output,
    ...configPrepared
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

  const configPrepared = prepareConfig(config)

  const duration = getDuration(configPrepared)

  const { filename } = getFileComponents(configPrepared.input)

  const frames = []

  console.log(`Extract frames from ${configPrepared.input}`)

  for (let i = 0; i < configPrepared.number; i++) {
    let clipStart = (duration / configPrepared.number * i) + 1

    if (i + 1 === configPrepared.number) {
      clipStart = duration - 1
    }

    const output = path.join(outputDirectory, `${filename}.frame.${String(i + 1).padStart(4, '0')}.jpg`)

    const frame = extractFrame({
      ...configPrepared,
      seek: clipStart,
      output
    })

    frames.push(frame)
  }

  return frames
}

export const prepareConfig = (config) => S.pipe([
  (config.duration
    ? (x) => ({
      ...x,
      duration: parseTime(config.duration)
    })
    : noop),

  (config.seek
    ? (x) => ({
      ...x,
      seek: parseTime(config.seek)
    })
    : noop),

  (config.seekeof
    ? (x) => ({
      ...x,
      seekeof: parseTime(config.seekeof)
    })
    : noop)
])(config)

export const extractClips = (outputDirectory) => (config) => {
  if (!config.input) throw new Error('Missing input')

  const configPrepared = prepareConfig(config)

  const duration = getDuration(configPrepared)

  // const timeOffset = config.timeOffsetStart + config.timeOffsetEnd

  // if (duration > timeOffset) {
  //   duration = duration - timeOffset
  // }

  const { filename, extension } = getFileComponents(configPrepared.input)

  const clips = []

  const clipDuration = configPrepared.duration / (configPrepared.number - 1)
  const clipInterval = duration / configPrepared.number

  const pointsOfInterest = (configPrepared.pointsOfInterest
    ? configPrepared.pointsOfInterest
      .split(',')
      .map(parseTime)
      .map((x) => Math.round((x - (clipDuration * 0.25)) * 10) / 10)
      .filter((x) => {
        return x > 0 && x < duration
      })
      .map((x) => createPointOfTime(x)(clipDuration))
    : [])

  const points = [
    ...pointsOfInterest
  ]

  for (let i = 0; i < configPrepared.number; i++) {
    const start = Math.round((clipInterval * i) * 10) / 10

    points.push(createPointOfTime(start)(clipDuration))
  }

  const pointsSorted = points.sort((a, b) => a.start - b.start)

  const pointsMerged = mergePointsOfTime(pointsSorted)

  // console.log(pointsMerged)

  // throw new Error('foo')

  console.log(`Extract clips from ${configPrepared.input}`)

  pointsMerged.forEach((point, index) => {
    const output = path.join(outputDirectory, `${filename}.clip.${index + 1}${extension}`)

    const clip = extractClip({
      ...configPrepared,
      output,
      seek: point.start,
      duration: point.duration
    })

    clips.push(clip)
  })

  return clips
}

export const montageFrames = (frames) => (config) => {
  if (!config.output) throw new Error('Missing output')

  const configPrepared = prepareConfig(config)

  console.log(`Montage frames to ${configPrepared.output}`)

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
        addArgument(createArgument()()(configPrepared.output))
      )
    )
  ])(attempt(() => createCMD('montage')))

  const result = fork(process)

  if (S.isRight(result)) {
    return configPrepared.output
  } else {
    throw result.value
  }
}

export const getDuration = (config) => {
  if (!config.input) throw new Error('Missing input')

  const configPrepared = prepareConfig(config)

  console.log(`Get duration of ${configPrepared.input}`)

  const process = S.pipe([
    S.chain(
      S.encase(
        setArgument(
          ffprobeArguments.input(configPrepared.input)
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
