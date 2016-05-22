function hyphen2camel(hyphenString) {
  return hyphenString.replace(/-([a-z])/g, function(match) {
    return match[1].toUpperCase();
  });
}

module.exports = hyphen2camel;
