#!/usr/bin/env node
/**
 * Post-build script to inject modulepreload hints for critical JS files
 * This reduces the critical path latency by allowing parallel downloads
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const distDir = join(process.cwd(), 'dist')
const htmlPath = join(distDir, 'index.html')
const astroDir = join(distDir, '_astro')

// Find all JS files that should be preloaded (exclude lazy-loaded chunks)
const jsFiles = readdirSync(astroDir)
  .filter(f => f.endsWith('.js'))
  .filter(f => !f.startsWith('essences.')) // 遅延ロードのため除外
  .map(f => `/_astro/${f}`)

// Generate modulepreload links
const preloadLinks = jsFiles
  .map(file => `<link rel="modulepreload" href="${file}">`)
  .join('\n    ')

// Read and modify HTML
let html = readFileSync(htmlPath, 'utf-8')

// Insert modulepreload links right after <meta charset="UTF-8">
html = html.replace(
  '<meta charset="UTF-8">',
  `<meta charset="UTF-8">\n    ${preloadLinks}`
)

writeFileSync(htmlPath, html)

console.log(`Injected modulepreload hints for ${jsFiles.length} JS files:`)
jsFiles.forEach(f => console.log(`  - ${f}`))
