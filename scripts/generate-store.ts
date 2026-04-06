import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Import lazily so this script can run in CI with env vars.
  const { runPipeline } = await import('../src/lib/pipeline');

  const store = await runPipeline();

  const outDir = path.join(process.cwd(), 'public', 'data');
  const outFile = path.join(outDir, 'store.json');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(store, null, 2) + '\n', 'utf-8');

  console.log(`[generate-store] Wrote ${store.articles.length} articles to ${outFile}`);
}

main().catch((e) => {
  console.error('[generate-store] Failed:', e);
  process.exit(1);
});

