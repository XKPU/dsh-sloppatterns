import assert from 'node:assert/strict'
import {
  changelogText,
  checkDesignText,
  findPattern,
  getPatternText,
  listPatternsText,
  meta,
  searchPatternsText,
  whyText,
} from '../lib/core.js'

assert.equal(meta.patterns, 534)
assert.equal(meta.rules, 104)

const gradient = checkDesignText('<div class="hero" style="background:linear-gradient(135deg,#6366F1,#8B5CF6)"><h1>Ship faster</h1></div>')
assert.match(gradient, /A1\s+The Unchosen Gradient/)
assert.match(gradient, /Fix:/)
assert.match(gradient, /Slop Patterns v\d+\.\d+\.\d+/)

const clean = checkDesignText('<main><h1>Field notes</h1><p>Plain text.</p></main>')
assert.match(clean, /No documented slop patterns detected/)

const oversized = checkDesignText('x'.repeat(300001))
assert.match(oversized, /more than 300 KB/)

const all = listPatternsText()
assert.match(all, /534 patterns\./)
const behavioral = listPatternsText('behavioral')
assert.ok(!behavioral.includes('\tsurface\t') && behavioral.endsWith('patterns.'))

const search = searchPatternsText('gradient headline')
assert.match(search, /A10\tgradient-text-headline/)

const byCode = getPatternText('a1')
assert.match(byCode, /The Unchosen Gradient/)
assert.match(byCode, /THE FIX/)
assert.match(byCode, /https:\/\/sloppatterns\.com\/#the-unchosen-gradient/)
assert.equal(findPattern('the-unchosen-gradient').code, 'A1')
assert.match(getPatternText('nope'), /No pattern "nope"/)

assert.match(whyText('a1'), /WHY|Tailwind|trained|indigo/i)
assert.match(whyText('nope'), /No pattern "nope"/)

const changelog = changelogText()
assert.match(changelog, /Slop Patterns v1\.4\.0/)
assert.match(changelog, /Versioning:/)

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
})) noChinese(label, text)
for (const line of all.split('\n')) {
  const match = /^[^\t]+\t([^\t]+)\t/.exec(line)
  if (!match) continue
  const id = match[1]
  noChinese(`getPattern(${id})`, getPatternText(id))
  noChinese(`why(${id})`, whyText(id))
}

console.log('core tests passed')