// Test related imports.
import 'chai/register-expect'

// App related imports.
import {
  createFFmpeg,
  createInput,
  createArgument,
  addArgument,
  setArgument,
  addInput,
  compileArgument,
  compileInput,
  compileFFmpeg,
  inputArguments,
  ffmpegArguments
} from '../../src/ffmpeg'

describe('tests ffmpeg module', function () {
  describe('tests create', function () {
    it('createFFmpeg', function () {
      const received = createFFmpeg()
      const expected = {
        path: 'ffmpeg',
        inputs: [],
        arguments: [],
        output: undefined
      }

      expect(received).to.deep.equal(expected)
    })

    it('createInput', function () {
      const received = createInput('foobar')
      const expected = {
        path: 'foobar',
        arguments: []
      }

      expect(received).to.deep.equal(expected)
    })

    it('createArgument', function () {
      const received = createArgument('-t')(5)
      const expected = {
        argument: '-t',
        value: '5'
      }

      expect(received).to.deep.equal(expected)
    })
  })

  describe('tests add / set', function () {
    it('addInput', function () {
      const ffmpeg = createFFmpeg()
      const input = createInput('foobar')

      const received = addInput(input)(ffmpeg)
      const expected = {
        ...ffmpeg,
        inputs: [
          input
        ]
      }

      expect(received).to.deep.equal(expected)
    })

    it('addArgument', function () {
      const ffmpeg = createFFmpeg()
      const argument = createArgument('-t')(5)

      const received = addArgument(argument)(ffmpeg)
      const expected = {
        ...ffmpeg,
        arguments: [
          argument
        ]
      }

      expect(received).to.deep.equal(expected)
    })

    it('setArgument', function () {
      const argument = createArgument('-t')(5)
      const ffmpeg = createFFmpeg(
        'ffmpeg',
        [],
        [
          argument
        ]
      )

      const received = setArgument(argument)(ffmpeg)
      const expected = {
        ...ffmpeg,
        arguments: [
          argument
        ]
      }

      expect(received).to.deep.equal(expected)
    })
  })

  describe('tests compile', function () {
    it('compileArgument', function () {
      const argument = createArgument('-t')(5)

      const received = compileArgument(argument)
      const expected = ['-t', '5']

      expect(received).to.deep.equal(expected)
    })

    it('compileArgument without value', function () {
      const argument = createArgument('-t')()

      const received = compileArgument(argument)
      const expected = ['-t']

      expect(received).to.deep.equal(expected)
    })

    it('compileInput', function () {
      const argument = createArgument('-t')(5)
      const input = createInput('foobar', [
        argument
      ])

      const received = compileInput(input)
      const expected = ['-t', '5', '-i', 'foobar']

      expect(received).to.deep.equal(expected)
    })

    it('compileFFmpeg', function () {
      const input = createInput('foobar')
      const argument = createArgument('-t')(5)
      const ffmpeg = createFFmpeg(
        'ffmpeg', [
        input
      ],
        [
          argument
        ],
        'output'
      )

      const received = compileFFmpeg(ffmpeg)
      const expected = ['-i', 'foobar', '-t', '5', 'output']

      expect(received).to.deep.equal(expected)
    })
  })

  describe('tests inputArguments', function () {
    it('createSeekArgument', function () {
      const received = inputArguments.createSeekArgument(60)
      const expected = {
        argument: '-ss',
        value: '60'
      }

      expect(received).to.deep.equal(expected)
    })

    it('createSeekEofArgument', function () {
      const received = inputArguments.createSeekEofArgument(-60)
      const expected = {
        argument: '-sseof',
        value: '-60'
      }

      expect(received).to.deep.equal(expected)
    })

    it('createDurationArgument', function () {
      const received = inputArguments.createDurationArgument(5)
      const expected = {
        argument: '-t',
        value: '5'
      }

      expect(received).to.deep.equal(expected)
    })
  })

  describe('tests ffmpegArguments', function () {
    it('createOverrideArgument', function () {
      const received = ffmpegArguments.createOverrideArgument()
      const expected = {
        argument: '-y',
        value: undefined
      }

      expect(received).to.deep.equal(expected)
    })

    it('createVideoFilterArgument', function () {
      const received = ffmpegArguments.createVideoFilterArgument()
      const expected = {
        argument: '-vf',
        value: undefined
      }

      expect(received).to.deep.equal(expected)
    })

    it('createFilterComplexArgument', function () {
      const received = ffmpegArguments.createFilterComplexArgument()
      const expected = {
        argument: '-filter_complex',
        value: undefined
      }

      expect(received).to.deep.equal(expected)
    })
  })
})