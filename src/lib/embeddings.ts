// Embeddings multilingües locales (transformers.js + ONNX). Sin servicios externos en tiempo de ejecución.
import { env, pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

export const MODELO_EMBEDDINGS = "Xenova/multilingual-e5-small";
export const DIM = 384;

env.cacheDir = process.env.MODELS_DIR ?? `${process.cwd()}/models`;
// Con MODELS_OFFLINE=1 solo se usa el modelo ya descargado (demo sin internet, T10).
if (process.env.MODELS_OFFLINE === "1") env.allowRemoteModels = false;

let extractor: Promise<FeatureExtractionPipeline> | null = null;
const cargar = () =>
  (extractor ??= pipeline("feature-extraction", MODELO_EMBEDDINGS, { dtype: "q8" }) as Promise<FeatureExtractionPipeline>);

/** e5 espera el prefijo "query: " para textos cortos simétricos (titulares y consultas). */
export async function embeber(textos: string[], lote = 64): Promise<number[][]> {
  const fe = await cargar();
  const out: number[][] = [];
  for (let i = 0; i < textos.length; i += lote) {
    const t = await fe(textos.slice(i, i + lote).map((s) => `query: ${s}`), { pooling: "mean", normalize: true });
    out.push(...(t.tolist() as number[][]));
  }
  return out;
}

/** Vectores normalizados: el coseno es el producto punto. */
export const coseno = (a: number[], b: number[]) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};
