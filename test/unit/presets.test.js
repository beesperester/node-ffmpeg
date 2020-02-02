// Test related imports.
import 'chai/register-expect'

import S from 'sanctuary'

import * as libcmdli from '../../src/cmdli'
import * as libffmpeg from '../../src/ffmpeg'
import presets from '../../src/ffmpeg/presets'

describe('tests presets module', function() {
  describe('tests videoFilter', function() {
    it('v360.fisheye', function() {
      const received = presets.videoFilter.v360.fisheye(180)(180)('sbs')('flat')(120)(90)('2d')(1920)(1080)
      const expected = 'v360=fisheye:flat:ih_fov=180:iv_fov=180:h_fov=120:v_fov=90:in_stereo=sbs:out_stereo=2d:w=1920:h=1080'

      expect(received).to.equal(expected)
    })

    it('stereo3d.left', function() {
      const received = presets.videoFilter.stereo3d.left()
      const expected = 'stereo3d=sbsl:ml'

      expect(received).to.equal(expected)
    })
  })

  describe('tests ffmpeg application', function() {
    it('stereoVr180x180to2d', function() {
      const ffmpeg = S.Right(libffmpeg.createFFmpeg())

      const received = presets.ffmpeg.stereoVr180x180to2d(1920)(1080)(ffmpeg)
      const expected = {
        ...libffmpeg.createFFmpeg(),
        arguments: [
          {
            argument: '-vf',
            constraints: [
              {
                argument: '-filter_complex',
                flag: libcmdli.constraintFlags.mustNotExist
              }
            ],
            value: 'v360=fisheye:flat:ih_fov=180:iv_fov=180:h_fov=120:v_fov=90:in_stereo=sbs:out_stereo=2d:w=1920:h=1080'
          }
        ]
      }

      expect(S.isRight(received)).to.be.true
      expect(received.value).to.deep.equal(expected)
    })

    it('gif', function() {
      const ffmpeg = S.Right(libffmpeg.createFFmpeg())

      const received = presets.ffmpeg.gif(640)(ffmpeg)
      const expected = {
        ...libffmpeg.createFFmpeg(),
        arguments: [
          {
            argument: '-filter_complex',
            constraints: [
              {
                argument: '-vf',
                flag: libcmdli.constraintFlags.mustNotExist
              }
            ],
            value: '[0:v] fps=12,scale=w=640:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1'
          }
        ]
      }

      expect(S.isRight(received)).to.be.true
      expect(received.value).to.deep.equal(expected)
    })
  })

  describe('tests ffprobe application', function() {
    it('duration', function() {
      const ffprobe = S.Right(libffmpeg.createFFprobe())

      const received = presets.ffprobe.duration(ffprobe)
      const expected = {
        ...libffmpeg.createFFprobe(),
        arguments: [
          {
            argument: '-show_entries',
            value: 'format=duration',
            constraints: []
          },
          {
            argument: '-v',
            value: 'quiet',
            constraints: []
          },
          {
            argument: '-of',
            value: 'csv=p=0',
            constraints: []
          }
        ]
      }

      expect(S.isRight(received)).to.be.true
      expect(received.value).to.deep.equal(expected)
    })
  })
})