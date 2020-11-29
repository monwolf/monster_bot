
module.exports = {
  extract_metadata: function (text) {
    var result = {}
    var match = text.match(/(?<=\|\|)(.*?)(?=\|\|)/)
    if (match) {
      result = JSON.parse(match[0])
    }
    return result
  },
  toCamelCase: function (str) {
    return str
      .replace(/\s(.)/g, function ($1) { return $1.toUpperCase() })
      .replace(/\s/g, '')
      .replace(/^(.)/, function ($1) { return $1.toLowerCase() })
  }
}
