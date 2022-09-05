// author: inu1255

const apis = {
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

onmessage = (event) => {
  const data = event.data
  if (!data) return
  const { cb, method, args } = data
  if (!apis[method]) {
    postMessage({ cb, err: 'no such method' })
    return
  }
  apis[method].apply(null, args).then(
    (res) => postMessage({ cb, data: res }),
    (err) => postMessage({ cb, err })
  )
}
