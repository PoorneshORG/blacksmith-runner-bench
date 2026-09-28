"use strict";

// CPU-bound recommendation-engine style benchmark: computes a pairwise
// product-similarity matrix (cosine similarity over synthetic user
// interaction vectors) using worker_threads, sharded across every
// available core. Deterministic (seeded PRNG) so the workload is
// byte-identical across runner configs -- differences in wall-clock
// time are purely a function of runner CPU/core count and memory
// bandwidth, not randomness. Matrix lives in a SharedArrayBuffer so
// it's referenced, not copied, into each worker.

const os = require("os");
const { Worker, isMainThread, workerData, parentPort } = require("worker_threads");

const N = Number(process.env.BENCH_N || 17000); // number of products
const M = Number(process.env.BENCH_M || 600); // interaction-vector length (users)
const WORKERS = Number(process.env.BENCH_WORKERS || os.cpus().length);

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSharedMatrix(n, m) {
  const rand = mulberry32(42);
  const buffer = new SharedArrayBuffer(n * m * 8);
  const flat = new Float64Array(buffer);
  for (let i = 0; i < n * m; i++) flat[i] = rand();
  return buffer;
}

function similarityForRow(flat, n, m, rowIndex) {
  const aOffset = rowIndex * m;
  let normA = 0;
  for (let k = 0; k < m; k++) normA += flat[aOffset + k] * flat[aOffset + k];
  normA = Math.sqrt(normA);

  let checksum = 0;
  for (let j = 0; j < n; j++) {
    const bOffset = j * m;
    let dot = 0;
    let normB = 0;
    for (let k = 0; k < m; k++) {
      dot += flat[aOffset + k] * flat[bOffset + k];
      normB += flat[bOffset + k] * flat[bOffset + k];
    }
    checksum += dot / (normA * Math.sqrt(normB) + 1e-9);
  }
  return checksum;
}

if (isMainThread) {
  const start = Date.now();
  const buffer = buildSharedMatrix(N, M);

  console.log(`analytics-benchmark: N=${N} products, M=${M} interactions, workers=${WORKERS}`);

  const rowsPerWorker = Math.ceil(N / WORKERS);
  const tasks = [];

  for (let w = 0; w < WORKERS; w++) {
    const from = w * rowsPerWorker;
    const to = Math.min(N, from + rowsPerWorker);
    if (from >= to) continue;
    tasks.push(
      new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { buffer, n: N, m: M, from, to },
        });
        worker.on("message", resolve);
        worker.on("error", reject);
      })
    );
  }

  Promise.all(tasks).then((results) => {
    const totalChecksum = results.reduce((acc, r) => acc + r.checksum, 0);
    const elapsedMs = Date.now() - start;
    console.log(
      `analytics-benchmark: done in ${elapsedMs}ms across ${tasks.length} workers, checksum=${totalChecksum.toFixed(4)}`
    );
  });
} else {
  const { buffer, n, m, from, to } = workerData;
  const flat = new Float64Array(buffer);
  let checksum = 0;
  for (let i = from; i < to; i++) {
    checksum += similarityForRow(flat, n, m, i);
  }
  parentPort.postMessage({ checksum });
}
