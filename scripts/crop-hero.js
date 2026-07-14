const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'products');

async function processImages() {
  const files = fs.readdirSync(dir).filter(f => f.includes('_main_') && f.endsWith('.png') && !f.includes('_desktop') && !f.includes('_mobile'));
  
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const desktopPath = path.join(dir, file.replace('.png', '_desktop.png'));
    const mobilePath = path.join(dir, file.replace('.png', '_mobile.png'));
    
    const metadata = await sharp(inputPath).metadata();
    
    // For Desktop (16:9)
    let dWidth = metadata.width;
    let dHeight = Math.round(metadata.width * 9 / 16);
    if (dHeight > metadata.height) {
        dHeight = metadata.height;
        dWidth = Math.round(metadata.height * 16 / 9);
    }
    
    await sharp(inputPath)
      .resize(dWidth, dHeight, { fit: 'cover', position: 'center' })
      .toFile(desktopPath);
      
    console.log(`Created ${desktopPath}`);
    
    // For Mobile (9:16)
    let mHeight = metadata.height;
    let mWidth = Math.round(metadata.height * 9 / 16);
    if (mWidth > metadata.width) {
        mWidth = metadata.width;
        mHeight = Math.round(metadata.width * 16 / 9);
    }
    
    await sharp(inputPath)
      .resize(mWidth, mHeight, { fit: 'cover', position: 'center' })
      .toFile(mobilePath);
      
    console.log(`Created ${mobilePath}`);
  }
}

processImages().catch(console.error);
