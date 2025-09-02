// vosklet.d.ts

declare global {
  interface Window {
    loadVosklet(): Promise<Module>;
  }
}

export type EpMode =
  | "ANSWER_DEFAULT"
  | "DISABLED"
  | "FAST"
  | "MEDIUM"
  | "SLOW";

export interface Module {
  createModel(url: string, path: string, id: string): Promise<Model>;
  createSpkModel(url: string, path: string, id: string): Promise<SpkModel>;
  createRecognizer(model: Model, sampleRate: number): Promise<Recognizer>;
  createRecognizerWithSpkModel(
    model: Model,
    spkModel: SpkModel,
    sampleRate: number
  ): Promise<Recognizer>;
  createRecognizerWithGrm(
    model: Model,
    grammar: string,
    sampleRate: number
  ): Promise<Recognizer>;
  setLogLevel(level: number): void;
  createTransferer(
    ctx: AudioContext,
    bufferSize: number
  ): Promise<AudioWorkletNode>;
  cleanUp(): Promise<void>;
  getModelCache(): Promise<Cache>;
  EpMode: EpMode;
}

export interface Model {
  findWord(word: string): number;
  delete(): void;
}

export interface SpkModel {
  delete(): void;
}

export interface Recognizer extends EventTarget {
  acceptWaveform(audioData: Float32Array): void;
  setWords(words: boolean): void;
  setPartialWords(partialWords: boolean): void;
  setNLSML(nlsml: boolean): void;
  setMaxAlternatives(alts: number): void;
  setGrm(grammar: string): void;
  setSpkModel(model: SpkModel): void;
  setEndpointerMode(mode: EpMode): void;
  setEndpointerDelays(
    tStartMax: number,
    tEnd: number,
    tMax: number
  ): void;

  delete(processCurrent?: boolean): Promise<void>;
}

