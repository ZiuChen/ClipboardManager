const { existsSync, readFileSync, writeFileSync, mkdirSync, watch } = require('fs')
const crypto = require('crypto')
const listener = require('./listener')
const { clipboard } = require('electron')
const time = require('./time')

window.exports = {
  utools,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  watch,
  crypto,
  listener,
  clipboard,
  time,
  Buffer
}
