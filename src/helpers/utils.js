
module.exports = {
  extract_metadata: function (text) {
    var result = {}
    var match = text.match(/(?<=\|\|)(.*?)(?=\|\|)/)
    if (match) {
      result = JSON.parse(match[0])
    }
    return result
  }
}
