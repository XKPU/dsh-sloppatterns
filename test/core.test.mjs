import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  changelogText,
  checkDesignJson,
  checkDesignText,
  findPattern,
  GRADED,
  getPatternText,
  listPatternsJson,
  listPatternsText,
  meta,
  searchPatternsText,
  whyText,
} from '../lib/core.js'
import { scanPathJson, scanPathText } from '../lib/scan.js'

assert.equal(meta.version, '1.7.0')
assert.equal(meta.patterns, 550)
assert.equal(meta.rules, 104)
assert.equal(meta.checked, 101)

const gradient = checkDesignText('<div class="hero" style="background:linear-gradient(135deg,#6366F1,#8B5CF6)"><h1>Ship faster</h1></div>')
assert.match(gradient, /A1\s+The Unchosen Gradient/)
assert.match(gradient, /Fix:/)
assert.match(gradient, /Slop Patterns v\d+\.\d+\.\d+/)

const clean = checkDesignText('<main><h1>Field notes</h1><p>Plain text.</p></main>')
assert.match(clean, /No documented slop patterns detected/)

const oversized = checkDesignText('x'.repeat(300001))
assert.match(oversized, /more than 300 KB/)

const all = listPatternsText()
assert.match(all, /550 patterns\./)
const behavioral = listPatternsText('behavioral')
assert.ok(!behavioral.includes('\tsurface\t') && behavioral.endsWith('patterns.'))

const search = searchPatternsText('gradient headline')
assert.match(search, /A10\tgradient-text-headline/)

const oversight = getPatternText('stop-doesnt-stop')
assert.match(oversight, /B263\s+Stop Doesn't Stop/)
assert.match(oversight, /THE FIX/)

const byCode = getPatternText('a1')
assert.match(byCode, /The Unchosen Gradient/)
assert.match(byCode, /THE FIX/)
assert.match(byCode, /https:\/\/sloppatterns\.com\/#the-unchosen-gradient/)
assert.equal(findPattern('the-unchosen-gradient').code, 'A1')
assert.match(getPatternText('nope'), /No pattern "nope"/)

assert.match(whyText('a1'), /WHY|Tailwind|trained|indigo/i)
assert.match(whyText('nope'), /No pattern "nope"/)

const changelog = changelogText()
assert.match(changelog, /Slop Patterns v1\.7\.0/)
assert.match(changelog, /B263 Stop Doesn't Stop/)
assert.match(changelog, /Versioning:/)

assert.equal(meta.graded, 5)
assert.deepEqual(GRADED, ['A3', 'A10', 'A15', 'A23', 'A36'])

const gradientMarkup = '<div class="hero"><h1 class="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Ship faster</h1></div>'
const gradedText = checkDesignText(gradientMarkup)
assert.match(gradedText, /A10\s+Gradient Text Headline \[graded\]/)
assert.doesNotMatch(gradedText, /STRICT:/)
const strictText = checkDesignText(gradientMarkup, { strict: true })
assert.match(strictText, /STRICT: FAIL \(A10\)/)
const strictClean = checkDesignText('<main><h1>Field notes</h1><p>Plain text.</p></main>', { strict: true })
assert.match(strictClean, /STRICT: PASS \(no graded patterns\)/)

const gradientJsonText = checkDesignJson(gradientMarkup)
const gradientJson = JSON.parse(gradientJsonText)
assert.equal(gradientJson.clean, false)
assert.equal(gradientJson.strictPass, false)
assert.ok(gradientJson.graded.includes('A10'))
assert.ok(gradientJson.hits.some((h) => h.code === 'A10' && h.graded === true && h.url.endsWith('#gradient-text-headline')))
assert.match(gradientJson.library.version, /^1\./)
const oversizedJson = JSON.parse(checkDesignJson('x'.repeat(300001)))
assert.match(oversizedJson.error, /more than 300 KB/)

const listJsonText = listPatternsJson()
const listJson = JSON.parse(listJsonText)
assert.equal(listJson.length, 550)
assert.ok(listJson.every((p) => p.code && p.id && p.url))
assert.ok(JSON.parse(listPatternsJson('behavioral')).every((p) => p.track === 'behavioral'))

const scanRoot = mkdtempSync(path.join(os.tmpdir(), 'slop-scan-'))
let scanText = ''
let scanStrict = ''
let scanJsonText = ''
let scanClean = ''
let scanEmpty = ''
let scanMissing = ''
let scanLimited = ''
let scanLimitedJson = ''
try {
  mkdirSync(path.join(scanRoot, 'nested'))
  mkdirSync(path.join(scanRoot, 'node_modules'))
  mkdirSync(path.join(scanRoot, '.cache'))
  writeFileSync(path.join(scanRoot, 'site.css'), '.hero { background: linear-gradient(135deg, #6366F1, #8B5CF6); }\n')
  writeFileSync(path.join(scanRoot, 'index.html'), `<!doctype html><html><head><link rel="stylesheet" href="site.css"></head><body>${gradientMarkup}</body></html>`)
  writeFileSync(path.join(scanRoot, 'nested', 'clean.html'), '<main><h1>Field notes</h1><p>Plain text.</p></main>')
  writeFileSync(path.join(scanRoot, 'node_modules', 'ignored.html'), `<html><body>${gradientMarkup}</body></html>`)
  writeFileSync(path.join(scanRoot, '.cache', 'hidden.html'), `<html><body>${gradientMarkup}</body></html>`)

  scanText = scanPathText(scanRoot)
  scanStrict = scanPathText(scanRoot, { strict: true })
  scanJsonText = scanPathJson(scanRoot)
  scanClean = scanPathText(path.join(scanRoot, 'nested', 'clean.html'), { strict: true })
  scanLimited = scanPathText(scanRoot, { maxFiles: 1 })
  scanLimitedJson = scanPathJson(scanRoot, { maxFiles: 1 })
  mkdirSync(path.join(scanRoot, 'empty'))
  scanEmpty = scanPathText(path.join(scanRoot, 'empty'))
  scanMissing = scanPathText(path.join(scanRoot, 'missing'))
} finally {
  rmSync(scanRoot, { recursive: true, force: true })
}

assert.match(scanText, /Scanned 2 files/)
assert.match(scanText, /1 clean, 1 with findings/)
assert.match(scanText, /A10\s+Gradient Text Headline \[graded\]/)
assert.match(scanText, /A1\s+The Unchosen Gradient/)
assert.match(scanText, /Graded patterns: .*A10/)
assert.doesNotMatch(scanText, /ignored\.html|hidden\.html/)
assert.doesNotMatch(scanText, /STRICT:/)
assert.match(scanStrict, /STRICT: FAIL \(.*A10.*\)/)
assert.match(scanClean, /No documented slop patterns detected/)
assert.match(scanClean, /STRICT: PASS/)
assert.match(scanEmpty, /No \.html files found/)
assert.match(scanMissing, /Path not found/)
assert.match(scanLimited, /Stopped after 1 HTML file \(maxFiles\)/)

const scanJson = JSON.parse(scanJsonText)
assert.equal(scanJson.filesScanned, 2)
assert.equal(scanJson.filesClean, 1)
assert.equal(scanJson.truncated, false)
assert.ok(scanJson.graded.includes('A10'))
assert.equal(scanJson.strictPass, false)
assert.equal(scanJson.results.length, 2)
const indexFile = scanJson.results.find((r) => r.file.endsWith('index.html'))
assert.ok(indexFile.hits.some((h) => h.code === 'A10' && h.graded === true))
assert.ok(indexFile.hits.some((h) => h.code === 'A1'))
assert.equal(JSON.parse(scanLimitedJson).truncated, true)

// Model-facing output must stay English-only: some providers reject Chinese text.
const CJK = /[\p{Script=Han}\u3000-\u303f\uff01-\uff60\uffe0-\uffe6]/u
const noChinese = (label, text) => {
  const hit = text.match(CJK)
  assert.equal(hit, null, `${label} contains Chinese text: ${hit?.[0]}`)
}
for (const [label, text] of Object.entries({
  gradient,
  clean,
  oversized,
  list: all,
  behavioral,
  search,
  pattern: byCode,
  why: whyText('a1'),
  changelog,
  missingPattern: getPatternText('nope'),
  missingWhy: whyText('nope'),
  emptySearch: searchPatternsText(''),
  gradedText,
  strictText,
  strictClean,
  gradientJson: gradientJsonText,
  oversizedJson: JSON.stringify(oversizedJson),
  listJson: listJsonText,
  scanText,
  scanStrict,
  scanJson: scanJsonText,
  scanClean,
  scanEmpty,
  scanMissing,
  scanLimited,
  scanLimitedJson,
})) noChinese(label, text)
for (const line of all.split('\n')) {
  const match = /^[^\t]+\t([^\t]+)\t/.exec(line)
  if (!match) continue
  const id = match[1]
  noChinese(`getPattern(${id})`, getPatternText(id))
  noChinese(`why(${id})`, whyText(id))
}

console.log('core tests passed')