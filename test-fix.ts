import { ensureFullReport } from './src/lib/pipeline';
import * as fs from 'fs';
import * as path from 'path';

async function test() {
  const cacheDir = path.join(process.cwd(), '.cache');
  if (fs.existsSync(cacheDir)) {
    console.log('Cleaning up cache...');
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }

  console.log('Calling ensureFullReport for a slug (cache is missing)...');
  try {
    // This should trigger runPipeline() because ensureArticles() is called
    const article = await ensureFullReport('any-slug');
    console.log('Result:', article ? 'Found' : 'Not Found (expected if slug really doesn\'t exist, but pipeline should have run)');
  } catch (e) {
    console.error('Error during test:', e);
  }
}

test();
