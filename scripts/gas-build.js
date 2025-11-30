// scripts/gas-build.js - V10 Build Integration Script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CRM V10 Build Pipeline Starting...\n');

// Step 1: Build Frontend
console.log('📦 Step 1/4: Building Frontend (Vite)...');
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build complete\n');
} catch (error) {
  console.error('❌ Frontend build failed');
  process.exit(1);
}

// Step 2: Build Backend
console.log('�� Step 2/4: Building Backend (Webpack)...');
try {
  execSync('npx webpack', { stdio: 'inherit' });
  
  // ADDED: Bridge Injection for GAS
  console.log('🌉 Injecting GAS Bridge...');
  execSync('node scripts/inject-stubs.js', { stdio: 'inherit' });
  
  console.log('✅ Backend build complete\n');
} catch (error) {
  console.error('❌ Backend build failed');
  process.exit(1);
}

// Step 3: Integrate Frontend Assets into HTML
console.log('🔗 Step 3/4: Integrating Frontend Assets...');
try {
  const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
  const distDir = path.join(__dirname, '..', 'dist');
  
  const jsPath = path.join(assetsDir, 'main.js');
  // CSS might not exist if no styles are used, but usually Vite generates one.
  // We'll check for it.
  const cssPath = path.join(assetsDir, 'main.css'); // Vite usually outputs main.css if there are styles
  // Note: Vite might output assets/index.css or similar depending on config. 
  // Our vite config says: assetFileNames: '[name].[ext]', and we import index.css in main.tsx usually.
  // But wait, we didn't check if main.css exists in the previous successful builds.
  // Let's be safe and check what files are actually there if main.css is missing.
  
  if (!fs.existsSync(jsPath)) {
    throw new Error('main.js not found in dist/assets');
  }
  
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  let cssContent = '';
  if (fs.existsSync(cssPath)) {
    cssContent = fs.readFileSync(cssPath, 'utf8');
  } else {
    // Fallback: look for any .css file in assets
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    if (cssFile) {
      cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
    }
  }
  
  // Updated to 3-File Pattern (Separated Assets)
  // 1. index.html (with include tags)
  // 2. javascript.html (with <script> wrapper)
  // 3. stylesheet.html (with <style> wrapper)

  // javascript.html
  const jsTemplate = `<script>\n${jsContent}\n</script>`;
  fs.writeFileSync(path.join(distDir, 'javascript.html'), jsTemplate, 'utf8');

  // stylesheet.html
  const cssTemplate = `<style>\n${cssContent}\n</style>`;
  fs.writeFileSync(path.join(distDir, 'stylesheet.html'), cssTemplate, 'utf8');

  // index.html
  const htmlTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM V10</title>
  <?!= include('stylesheet'); ?>
</head>
<body>
  <div id="root"></div>
  <?!= include('javascript'); ?>
</body>
</html>`;
  
  fs.writeFileSync(path.join(distDir, 'index.html'), htmlTemplate, 'utf8');
  console.log('✅ Frontend assets integrated into index.html\n');
  
} catch (error) {
  console.error('❌ Asset integration failed:', error.message);
  process.exit(1);
}

// Step 4: Copy appsscript.json and cleanup
console.log('🧹 Step 4/4: Finalizing build...');
try {
  const appsscriptSrc = path.join(__dirname, '..', 'appsscript.json');
  const appsscriptDest = path.join(__dirname, '..', 'dist', 'appsscript.json');
  
  if (fs.existsSync(appsscriptSrc)) {
    fs.copyFileSync(appsscriptSrc, appsscriptDest);
  } else {
    console.warn('⚠️ appsscript.json not found in root, skipping copy.');
  }
  
  const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    try {
      // Try to remove, but don't fail the build if it's locked (common on Windows)
      // using rimraf from devDependencies if possible, or fs.rmSync
      try {
        require('rimraf').sync(assetsDir);
      } catch (rimrafError) {
        fs.rmSync(assetsDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn('⚠️ Could not remove assets directory (might be locked), but build is successful. Error: ' + e.message);
    }
  }
  
  console.log('✅ Build finalized\n');
  
  const distFiles = fs.readdirSync(path.join(__dirname, '..', 'dist'));
  console.log('📁 dist/ contents:', distFiles.join(', '));
  console.log('\n✨ Build Complete! Ready for deployment.\n');
  
} catch (error) {
  console.error('❌ Finalization failed:', error.message);
  process.exit(1);
}