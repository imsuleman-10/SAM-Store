const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImages() {
  const artifactDir = 'C:\\Users\\Suleman Mughal\\.gemini\\antigravity-ide\\brain\\e213cabc-9e3c-44d0-9277-d2e531060505';
  const outDir = path.join(__dirname, '..', 'public', 'images', 'results');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const tasks = [
    { name: 'dermive', file: 'face_split_1784291760254.png' },
    { name: 'roots', file: 'hair_split_1784291804993.png' },
    { name: 'markaway', file: 'stretch_marks_split_1784291845541.png' },
  ];

  for (const t of tasks) {
    const inputPath = path.join(artifactDir, t.file);
    const metadata = await sharp(inputPath).metadata();
    
    const halfWidth = Math.floor(metadata.width / 2);

    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: halfWidth, height: metadata.height })
      .toFile(path.join(outDir, `${t.name}-before.png`));

    await sharp(inputPath)
      .extract({ left: halfWidth, top: 0, width: metadata.width - halfWidth, height: metadata.height })
      .toFile(path.join(outDir, `${t.name}-after.png`));

    console.log(`Processed ${t.name}`);
  }
}

processImages().catch(console.error);
