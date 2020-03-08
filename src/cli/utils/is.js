module.exports = {
  FILE,
  MODULE,
  URL
}

function FILE(s) {
  return !URL(s) && /\.json$/.test(s)
}

function MODULE(s) {
  try {
    require(s)
    return true
  } catch (error) {
    return error.code !== 'MODULE_NOT_FOUND'
  }
}

function URL(s) {
  return /^(http|https):/.test(s)
}
