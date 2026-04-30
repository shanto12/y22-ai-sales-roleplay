/**
 * PCM16 capture worklet for the xAI Grok Voice Agent realtime API.
 *
 * Receives Float32 audio frames from the realtime audio graph, accumulates
 * them into fixed-size frames (1024 samples), and posts each frame back to
 * the main thread for PCM16 encoding + WebSocket send.
 *
 * Loaded from a static URL (not a blob:) so the page's strict CSP can allow
 * script-src 'self' without needing blob: scripts.
 */
class PCM16CaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._frameSize = 1024
    this._buf = []
    this._count = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true
    const ch0 = input[0]
    this._buf.push(ch0.slice())
    this._count += ch0.length
    while (this._count >= this._frameSize) {
      const out = new Float32Array(this._frameSize)
      let written = 0
      while (written < this._frameSize && this._buf.length) {
        const head = this._buf[0]
        const need = this._frameSize - written
        if (head.length <= need) {
          out.set(head, written)
          written += head.length
          this._buf.shift()
        } else {
          out.set(head.subarray(0, need), written)
          this._buf[0] = head.subarray(need)
          written += need
        }
      }
      this._count -= this._frameSize
      this.port.postMessage(out, [out.buffer])
    }
    return true
  }
}

registerProcessor('pcm16-capture', PCM16CaptureProcessor)
