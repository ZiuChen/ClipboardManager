const { chmodSync, existsSync } = require('fs')
const { EventEmitter } = require('events')
const path = require('path')
const { execFile } = require('child_process')

class ClipboardEventListener extends EventEmitter {
  constructor() {
    super()
    this.child = null
    this.listening = false
  }
  startListening(dbPath) {
    const targetMap = {
      win32: 'clipboard-event-handler-win32.exe',
      linux: 'clipboard-event-handler-linux',
      darwin: 'clipboard-event-handler-mac'
    }
    const { platform } = process
    const target = path.resolve(
      dbPath.split('_utools_clipboard_manager_storage')[0],
      targetMap[platform]
    )
    if (!existsSync(target)) {
      this.emit('error', '剪贴板监听程序不存在')
      return
    }
    if (platform === 'win32') {
      this.child = execFile(target)
    } else if (platform === 'linux' || platform === 'darwin') {
      chmodSync(target, 0o755)
      this.child = execFile(target)
    } else {
      throw 'Not yet supported'
    }
    this.child.stdout.on('data', (data) => {
      if (data.trim() === 'CLIPBOARD_CHANGE') {
        this.emit('change')
      }
    })
    this.child.stdout.on('close', () => {
      this.emit('close')
      this.listening = false
    })
    this.child.stdout.on('exit', () => {
      this.emit('exit')
      this.listening = false
    })
    this.listening = true
  }
  stopListening() {
    const res = this.child.kill()
    this.listening = false
    return res
  }
}

module.exports = new ClipboardEventListener()
