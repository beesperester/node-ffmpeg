// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import { parseTime, createPointOfTime, mergePointsOfTime } from '../../src/cli/utilities'

describe('tests utilities module', function () {
  describe('tests parseTime', function () {
    it('with seconds string', function () {
      const received = parseTime('360')
      const expected = 360

      expect(received).to.deep.equal(expected)
    })

    it('with minutes string', function () {
      const received = parseTime('6:00')
      const expected = 6 * 60

      expect(received).to.deep.equal(expected)
    })

    it('with hours string', function () {
      const received = parseTime('1:10:0')
      const expected = (60 * 60) + (10 * 60)

      expect(received).to.deep.equal(expected)
    })

    it('with days string', function () {
      const received = parseTime('1:1:10:0')
      const expected = (24 * 60 * 60) + (60 * 60) + (10 * 60)

      expect(received).to.deep.equal(expected)
    })

    it('with weeks string', function () {
      const received = parseTime('1:1:1:10:0')
      const expected = (7 * 24 * 60 * 60) + (24 * 60 * 60) + (60 * 60) + (10 * 60)

      expect(received).to.deep.equal(expected)
    })
  })

  describe('tests pointsOfInterest', function () {
    it('tests createPointOfTime', function () {
      const received = createPointOfTime(5)(10)
      const expected = {
        start: 5,
        duration: 10
      }

      expect(received).to.deep.equal(expected)
    })
    it('tests merge overlapping points', function () {
      const points = [
        createPointOfTime(5)(10),
        createPointOfTime(6)(2),
        createPointOfTime(10)(10),
        createPointOfTime(25)(5)
      ]

      const received = mergePointsOfTime(points)
      const expected = [
        createPointOfTime(5)(15),
        createPointOfTime(25)(5)
      ]

      expect(received).to.deep.equal(expected)
    })
  })
})
