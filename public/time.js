// author: inu1255

const path = require('path')

function newPromise(fn) {
  let a, b
  var tmp = {
    resolve(x) {
      if (this.pending) {
        a(x)
        this.resolved = true
        this.pending = false
      }
    },
    reject(e) {
      if (this.pending) {
        b(e)
        this.rejectd = true
        this.pending = false
      }
    },
    pending: true,
    resolved: false,
    rejected: false
  }
  /** @type {Promise<T>} */
  var pms = new Promise(function (resolve, reject) {
    a = resolve
    b = reject
    if (fn) fn(tmp.resolve, tmp.reject)
  })
  return Object.assign(pms, tmp)
}

let cbIdx = 1
const cbMap = new Map()
function getWorker() {
  if (getWorker.worker) return getWorker.worker
  const worker = new Worker(path.join(__dirname, 'time.worker.js'))
  getWorker.worker = worker
  worker.onmessage = (e) => {
    if (e.data && cbMap.has(e.data.cb)) {
      cbMap.get(e.data.cb).apply(null, e.data.args)
    }
  }
  return worker
}

function call(method, args) {
  const cb = cbIdx++
  let pms = newPromise()
  cbMap.set(cb, function (err, data) {
    if (err) pms.reject(err)
    else pms.resolve(data)
  })
  getWorker().postMessage({
    method,
    args,
    cb
  })
  return pms
}

function sleep(ms) {
  return call('sleep', [ms])
}

exports.sleep = sleep
