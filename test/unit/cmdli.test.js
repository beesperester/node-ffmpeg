// Test related imports.
import 'chai/register-expect'

import * as libcmdli from '../../src/cmdli'

describe('tests cmdli module', function() {
  describe('tests creation', function() {
    it('createCMD', function() {
      const received = libcmdli.createCMD('ffmpeg')
      const expected = {
        path: 'ffmpeg',
        arguments: [],
        result: {
          stdout: '',
          stderr: ''
        }
      }

      expect(received).to.deep.equal(expected)
    })

    it('createConstraint', function() {
      const received = libcmdli.createConstraint('-ss')(libcmdli.constraintFlags.mustExist)
      const expected = {
        argument: '-ss',
        flag: libcmdli.constraintFlags.mustExist
      }

      expect(received).to.deep.equal(expected)
    })

    it('createArgument', function() {
      const received = libcmdli.createArgument('-ss')()(5)
      const expected = {
        argument: '-ss',
        constraints: [],
        value: '5'
      }

      expect(received).to.deep.equal(expected)
    })
  })

  describe('tests flow', function() {
    it('addArgument', function() {
      const cmd = libcmdli.createCMD('ffmpeg')
      const argument = libcmdli.createArgument('-ss')()(5)

      const received = libcmdli.addArgument(argument)(cmd)
      const expected = {
        path: 'ffmpeg',
        arguments: [
          {
            argument: '-ss',
            constraints: [],
            value: '5' 
          }
        ],
        result: {
          stdout: '',
          stderr: ''
        }
      }

      expect(received).to.deep.equal(expected)
    })

    it('setArgument', function() {
      let cmd = libcmdli.createCMD('ffmpeg')
      const firstArgument = libcmdli.createArgument('-ss')()(5)
      const secondArgument = libcmdli.createArgument('-ss')()(10)
      cmd = libcmdli.addArgument(firstArgument)(cmd)

      const received = libcmdli.setArgument(secondArgument)(cmd)
      const expected = {
        path: 'ffmpeg',
        arguments: [
          {
            argument: '-ss',
            constraints: [],
            value: '10' 
          }
        ],
        result: {
          stdout: '',
          stderr: ''
        }
      }

      expect(received).to.deep.equal(expected)
    })
  })
})