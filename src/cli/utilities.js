import S from 'sanctuary'
import { run } from '../cmdli'
import path from 'path'

export const noop = (x) => x

export const attempt = (f) => {
  const context = this
  try {
    return S.Right(f.call(context))
  } catch (exception) {
    return S.Left(new Error('Unable to attempt function call'))
  }
}

export const fork = S.pipe([
  S.chain(
    S.encase(
      run
    )
  )
])

export const getFileComponents = (file) => {
  const dirname = path.dirname(file) // /path/to/file
  const basename = path.basename(file) // filename.txt
  const extension = path.extname(file) // .txt
  const filename = basename.replace(extension, '') // filename

  return {
    dirname,
    basename,
    extension,
    filename
  }
}

export const parseTime = (time) => {
  const multipliers = [1, 60, 60 * 60, 24 * 60 * 60, 7 * 24 * 60 * 60]
  const parts = String(time).split(':').map(parseFloat)

  return parts.reduce((previousValue, currentValue, currentIndex) => {
    const multipliersSliced = multipliers.slice(0, parts.length)
    const multipliersReversed = multipliersSliced.reverse()

    return previousValue + (currentValue * multipliersReversed[currentIndex])
  }, 0)
}

export const createPointOfTime = (start) => (duration) => {
  return {
    start,
    duration
  }
}

export const isPointInRange = (point) => (start) => (stop) => {
  return start < point && point < stop
}

export const filterOverlappingPoints = (point) => (points) => points.filter((x) => {
  return isPointInRange(point.start)(x.start)(x.start + x.duration) ||
  isPointInRange(point.start + point.duration)(x.start)(x.start + x.duration) ||
  isPointInRange(x.start)(point.start)(point.start + point.duration) ||
  isPointInRange(x.start + x.duration)(point.start)(point.start + point.duration)
})

export const mergePointsOfTime = (points) => {
  const pointsMerged = []

  points.forEach((point) => {
    const pointsOverlapping = filterOverlappingPoints(point)(points)

    if (pointsOverlapping.length > 0) {
      const pointsLatest = pointsOverlapping.sort((a, b) => (a.start + a.duration) - (b.start + b.duration))
      const pointLatest = pointsLatest.pop()

      const pointMerged = createPointOfTime(point.start)(pointLatest.start + pointLatest.duration - point.start)

      if (!filterOverlappingPoints(pointMerged)(pointsMerged).length > 0) {
        pointsMerged.push(pointMerged)
      }
    } else {
      pointsMerged.push(point)
    }
  })

  return pointsMerged
}
