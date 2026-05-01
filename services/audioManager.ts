
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private bedGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private connectedElements = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
  
  constructor() {}

  public init() {
    if (this.audioContext?.state === 'closed') {
      this.audioContext = null;
      this.mainGain = null;
      this.bedGain = null;
      this.analyser = null;
    }

    if (!this.audioContext) {
      console.log("AudioManager: Initializing AudioContext...");
      try {
        const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
        
        // Try to let the browser choose the best sample rate first
        try {
          this.audioContext = new AudioCtx();
        } catch (e) {
          console.warn("AudioManager: Default AudioContext failed, falling back to 44100", e);
          this.audioContext = new AudioCtx({ sampleRate: 44100 });
        }
        
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.6; // More responsive

        this.mainGain = this.audioContext.createGain();
        this.mainGain.gain.value = 0.85; // Give some headroom to avoid distortion
        
        this.mainGain.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        this.bedGain = this.audioContext.createGain();
        this.bedGain.gain.value = 0.15; 
        this.bedGain.connect(this.audioContext.destination);
        console.log("AudioManager: Audio Graph built. State:", this.audioContext.state, "SampleRate:", this.audioContext.sampleRate);
      } catch (e) {
        console.error("AudioManager: Failed to initialize AudioContext", e);
      }
    }
  }

  public async forceUnlock(): Promise<void> {
    this.init();
    if (!this.audioContext) return;
    
    console.log("AudioManager: Forcing unlock. Current state:", this.audioContext.state);
    
    // Resume context if it's not running
    if (this.audioContext.state !== 'running') {
      try {
        await this.audioContext.resume();
        console.log("AudioManager: Context resumed successfully. New state:", this.audioContext.state);
      } catch (err) {
        console.error("AudioManager: Failed to resume context on unlock:", err);
      }
    }
    
    // Play a silent buffer to satisfy browser "activation" requirements
    try {
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      console.log("AudioManager: Silent buffer played for unlock.");
    } catch (e) {
      console.warn("AudioManager: Silent buffer play failed:", e);
    }
  }

  public async resume(): Promise<void> {
    this.init();
    if (this.audioContext && this.audioContext.state !== 'running') {
      try {
        console.log("AudioManager: Attempting to resume AudioContext from state:", this.audioContext.state);
        await this.audioContext.resume();
        console.log("AudioManager: Resume successful. State:", this.audioContext.state);
      } catch (err) {
        console.warn("AudioManager: Resume attempt failed:", err);
      }
    }
  }

  public async connectMediaElement(element: HTMLMediaElement) {
    await this.resume();
    if (!this.audioContext || !this.mainGain) return;
    
    if (this.connectedElements.has(element)) return;

    try {
      // Note: If crossOrigin is NOT set on the element, this WILL fail for cross-domain streams.
      // We handle this gracefully.
      const sourceNode = this.audioContext.createMediaElementSource(element);
      this.connectedElements.set(element, sourceNode);
      sourceNode.connect(this.mainGain);
      console.log("AudioManager: Connected MediaElement to graph.");
    } catch (err) {
      console.warn("AudioManager: Could not connect element to Web Audio. Playing direct audio only (Visualizer disabled for this source).", err);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  public async decodeAudio(data: Uint8Array): Promise<AudioBuffer> {
    this.init();
    if (!this.audioContext) throw new Error("AudioContext not initialized");

    console.log(`AudioManager: Decoding ${data.byteLength} bytes of PCM data...`);
    const sampleRate = 24000;
    const numChannels = 1;
    
    // 16-bit PCM = 2 bytes per sample
    const frameCount = Math.floor(data.byteLength / 2);
    if (frameCount === 0) {
      console.warn("AudioManager: Empty data received for decoding");
    }
    
    const buffer = this.audioContext.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    for (let i = 0; i < frameCount; i++) {
      // True = Little Endian
      channelData[i] = view.getInt16(i * 2, true) / 32768.0;
    }
    
    return buffer;
  }

  public async playBuffer(buffer: AudioBuffer, onEnded?: () => void, fadeTime = 0.1) {
    await this.resume();
    if (!this.audioContext || !this.mainGain) {
      console.error("AudioManager: Cannot play buffer - context or gain not initialized");
      return;
    }

    console.log(`AudioManager: Playing buffer. Duration: ${buffer.duration.toFixed(2)}s, State: ${this.audioContext.state}`);
    this.stop();

    const newSource = this.audioContext.createBufferSource();
    newSource.buffer = buffer;
    
    const individualGain = this.audioContext.createGain();
    newSource.connect(individualGain);
    individualGain.connect(this.mainGain);

    const now = this.audioContext.currentTime;
    // Use a small offset to ensure the ramp starts correctly
    const startTime = now + 0.01;
    
    individualGain.gain.setValueAtTime(0, startTime);
    individualGain.gain.linearRampToValueAtTime(1, startTime + fadeTime);

    newSource.onended = () => {
      console.log("AudioManager: Buffer playback ended.");
      if (this.currentSource === newSource && onEnded) {
        onEnded();
      }
    };

    newSource.start(startTime);
    this.currentSource = newSource;
  }

  public stop() {
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
      } catch (e) {}
      this.currentSource = null;
    }
  }

  public async testBeep() {
    await this.resume();
    if (!this.audioContext || !this.mainGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.mainGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
    console.log("AudioManager: Diagnostic beep played.");
  }
}

export const audioManager = new AudioManager();
