import { downloadFile, listFiles } from '@huggingface/hub';
import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable, Transform } from 'stream';
import cliProgress from 'cli-progress';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default model configuration - using a model that doesn't require auth
const DEFAULT_REPO = 'unsloth/gemma-3-270m-it-GGUF';

async function downloadModel() {
  const repo = process.argv[2] || DEFAULT_REPO;
  let filename = process.argv[3];

  // Get HF token from environment if available
  const credentials = process.env.HF_TOKEN ? { accessToken: process.env.HF_TOKEN } : undefined;

  const modelDir = resolve(__dirname, '../model');
  const envPath = resolve(__dirname, '../.env');

  console.log(`📦 Downloading model from Hugging Face...`);
  console.log(`   Repository: ${repo}`);

  // If filename not provided, find .gguf files in the repo
  if (!filename) {
    console.log(`🔍 Finding available .gguf files...`);

    try {
      const files = await listFiles({ repo, credentials });
      const ggufFiles = [];

      for await (const file of files) {
        if (file.type === 'file' && file.path.endsWith('.gguf')) {
          ggufFiles.push(file.path);
        }
      }

      if (ggufFiles.length === 0) {
        console.error(`❌ No .gguf files found in repository ${repo}`);
        console.log(`\n💡 Make sure the repository contains GGUF model files.`);
        process.exit(1);
      }

      // Prefer Q4_K_M quantization, or take the first one
      filename =
        ggufFiles.find(f => f.includes('Q4_K_M')) ||
        ggufFiles.find(f => f.includes('Q4')) ||
        ggufFiles[0];

      console.log(`✅ Found ${ggufFiles.length} .gguf file(s)`);
      console.log(`   Selected: ${filename}`);

      if (ggufFiles.length > 1) {
        console.log(`\n   Other available files:`);
        ggufFiles
          .filter(f => f !== filename)
          .forEach(f => {
            console.log(`   - ${f}`);
          });
        console.log(`\n   To download a different file, run:`);
        console.log(`   yarn download-model "${repo}" "<filename>"`);
      }
    } catch (error) {
      console.error(`❌ Error listing files:`, error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  const modelPath = resolve(modelDir, filename);

  console.log(`   File: ${filename}`);
  console.log(`   Destination: ${modelPath}`);

  // Create model directory if it doesn't exist
  if (!existsSync(modelDir)) {
    console.log(`📁 Creating model directory: ${modelDir}`);
    mkdirSync(modelDir, { recursive: true });
  }

  // Check if model already exists
  if (existsSync(modelPath)) {
    console.log(`⚠️  Model already exists at ${modelPath}`);
    const answer = await new Promise<string>(resolve => {
      process.stdout.write('   Overwrite? (y/N): ');
      process.stdin.once('data', data => {
        resolve(data.toString().trim().toLowerCase());
      });
    });

    if (answer !== 'y' && answer !== 'yes') {
      console.log('❌ Download cancelled');
      process.exit(0);
    }
  }

  process.stdin.pause();

  try {
    console.log(`⬇️  Downloading...`);

    const blob = await downloadFile({
      repo,
      path: filename,
      credentials,
    });

    if (!blob) {
      throw new Error('Failed to download file - blob is null');
    }

    const fileSize = blob.size;
    const progressBar = new cliProgress.SingleBar({
      format: '   Progress |{bar}| {percentage}% | {value}/{total} MB | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    progressBar.start(Math.round(fileSize / (1024 * 1024)), 0);

    let downloaded = 0;
    const progressTransform = new Transform({
      transform(chunk, encoding, callback) {
        downloaded += chunk.length;
        progressBar.update(Math.round(downloaded / (1024 * 1024)));
        callback(null, chunk);
      },
    });

    const stream = blob.stream();
    const nodeStream = Readable.fromWeb(stream as any);
    const fileStream = createWriteStream(modelPath);

    await pipeline(nodeStream, progressTransform, fileStream);

    progressBar.stop();
    console.log(`✅ Model downloaded successfully!`);

    // Update .env file
    updateEnvFile(envPath, filename);

    console.log(`\n🎉 Setup complete!`);
    console.log(`   Model: ${modelPath}`);
    console.log(`   .env updated with LOCAL_MODEL=model/${filename}`);
    console.log(`\nYou can now start the server with: yarn dev`);
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Error downloading model:`, errorMessage);

    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      console.log(`\n🔐 Authentication Required:`);
      console.log(`   This model requires a Hugging Face account and access token.`);
      console.log(`\n   Steps to fix:`);
      console.log(`   1. Create a free account at https://huggingface.co/join`);
      console.log(`   2. Visit the model page: https://huggingface.co/${repo}`);
      console.log(`   3. Accept any required terms/license agreements`);
      console.log(`   4. Create an access token at https://huggingface.co/settings/tokens`);
      console.log(`   5. Set the token as an environment variable:`);
      console.log(`      export HF_TOKEN=your_token_here`);
      console.log(`   6. Run this script again`);
      console.log(`\n   Or use a model that doesn't require authentication:`);
      console.log(`   yarn download-model "TheBloke/Mistral-7B-Instruct-v0.2-GGUF"`);
    } else {
      console.log(`\n💡 Troubleshooting tips:`);
      console.log(`   - Check your internet connection`);
      console.log(`   - Verify the repository and filename are correct`);
      console.log(`   - Try a different model from https://huggingface.co/models?library=gguf`);
    }
    process.exit(1);
  }
}

function updateEnvFile(envPath: string, filename: string) {
  let envContent = '';

  // Read existing .env file or create from .env.example
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  } else {
    const envExamplePath = resolve(dirname(envPath), '.env.example');
    if (existsSync(envExamplePath)) {
      envContent = readFileSync(envExamplePath, 'utf-8');
      console.log(`📝 Creating .env from .env.example`);
    }
  }

  // Update LOCAL_MODEL line
  const localModelPath = `model/${filename}`;
  const lines = envContent.split('\n');
  let updated = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('LOCAL_MODEL=') || lines[i].startsWith('# LOCAL_MODEL=')) {
      lines[i] = `LOCAL_MODEL=${localModelPath}`;
      updated = true;
      break;
    }
  }

  // If LOCAL_MODEL line doesn't exist, add it
  if (!updated) {
    lines.push(`LOCAL_MODEL=${localModelPath}`);
  }

  writeFileSync(envPath, lines.join('\n'), 'utf-8');
  console.log(`✅ Updated .env file`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n❌ Download cancelled by user');
  process.exit(0);
});

downloadModel().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
