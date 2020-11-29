const expect = require('chai').expect
// import math file
const math = require('../index')
describe('math.js tests', () => {
  describe('math.add() Test', () => {
    it('should equal 2', () => {
      const result = math.add(1, 1)
      expect(result).to.equal(2)
    })
  })

  describe('math.multiply() Test', () => {
    it('should equal 3', () => {
      const result = math.multiply(3, 1)
      expect(result).to.equal(3)
    })
    it('should equal 10', () => {
      const result = math.multiply(5, 2)
      expect(result).to.equal(10)
    })
  })
})
