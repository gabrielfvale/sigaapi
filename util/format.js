module.exports = {
  full: value => {
    return value.trim().replace(/\n/g, '').replace(/\t/g, '')
  }
}
