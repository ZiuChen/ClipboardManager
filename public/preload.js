const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const crypto = require('crypto')
const { clipboard } = require('electron')
const time = require('./time')

window.exports = {
  utools,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  crypto,
  clipboard,
  time
}
