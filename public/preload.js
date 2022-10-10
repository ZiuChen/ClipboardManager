const { existsSync, readFileSync, writeFileSync, mkdirSync, watch } = require('fs')
const { sep } = require('path')
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
  sep,
  crypto,
  listener,
  clipboard,
  time,
  Buffer
}
