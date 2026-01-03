import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceIcon = join(__dirname, 'public', 'app-icon-source.png');
const publicDir = join(__dirname, 'public');
const iosIconDir = join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

// 生成するアイコンのサイズ設定
const icons = [
  // PWA用
  { name: 'favicon.ico', size: 32, output: publicDir },
  { name: 'icon.png', size: 512, output: publicDir },
  { name: 'pwa-64x64.png', size: 64, output: publicDir },
  { name: 'pwa-192x192.png', size: 192, output: publicDir },
  { name: 'pwa-512x512.png', size: 512, output: publicDir },
  { name: 'maskable-icon-512x512.png', size: 512, output: publicDir },
  { name: 'apple-touch-icon-180x180.png', size: 180, output: publicDir },
  // iOS用
  { name: 'AppIcon-512@2x.png', size: 1024, output: iosIconDir },
];

async function generateIcons() {
  console.log('🎨 アイコン生成開始...\n');

  // ソースファイルの確認
  if (!existsSync(sourceIcon)) {
    console.error('❌ ソースアイコンが見つかりません:', sourceIcon);
    process.exit(1);
  }

  // 出力ディレクトリの確認
  if (!existsSync(iosIconDir)) {
    mkdirSync(iosIconDir, { recursive: true });
  }

  for (const icon of icons) {
    try {
      const outputPath = join(icon.output, icon.name);
      
      await sharp(sourceIcon)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ ${icon.name} の生成に失敗:`, error.message);
    }
  }

  console.log('\n🎉 アイコン生成完了！');
}

generateIcons();
