class VoxHireMicCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.samples = [];
    this.enabled = false;
    this.targetLength = 640;
    this.port.onmessage = (event) => {
      if (event.data?.type === "capture") this.enabled = event.data.value;
    };
  }

  process(inputs) {
    if (!this.enabled || !inputs[0]?.[0]) return true;
    const input = inputs[0][0];
    const ratio = sampleRate / 16000;
    for (let index = 0; index < input.length; index += ratio) {
      this.samples.push(Math.max(-1, Math.min(1, input[Math.floor(index)])));
    }
    while (this.samples.length >= this.targetLength) {
      const packet = this.samples.splice(0, this.targetLength);
      const pcm = new Int16Array(packet.length);
      packet.forEach((sample, index) => { pcm[index] = sample * 0x7fff; });
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
    }
    return true;
  }
}

registerProcessor("voxhire-mic-capture", VoxHireMicCapture);
