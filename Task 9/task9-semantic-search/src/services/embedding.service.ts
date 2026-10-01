let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    const { pipeline } = await import("@huggingface/transformers");
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
    );
  }
  return extractor;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = await getExtractor();
  const output = await model(text.replace(/\n/g, " "), {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data as Float32Array);
}