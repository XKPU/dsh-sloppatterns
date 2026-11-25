import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { checkDesign, RULES } = require('../vendor/slop-patterns/rules.js')
const PATTERNS = require('../vendor/slop-patterns/patterns.json')
const LIB = require('../vendor/slop-patterns/library.json')

const CHECKED_CODES = new Set(RULES.map((r) => r.code))
const CHECKED = PATTERNS.filter((p) => CHECKED_CODES.has(p.code)).length
const byId = Object.fromEntries(PATTERNS.map((p) => [p.id, p]))
const byCode = Object.fromEntries(PATTERNS.map((p) => [p.code.toLowerCase(), p]))
const MAX_SNIPPET = 300000

export const GRADED = ['A3', 'A10', 'A15', 'A23', 'A36']
const GRADED_SET = new Set(GRADED)
const urlFor = (p) => `https://sloppatterns.com/#${p.id}`

export const meta = {
  version: LIB.version,
  released: LIB.released,
  patterns: PATTERNS.length,
  rules: RULES.length,
  checked: CHECKED,
  graded: GRADED.length,
}

export function libraryInfo() {
  return { version: LIB.version, released: LIB.released, patterns: PATTERNS.length, rules: RULES.length, checked: CHECKED }
}

export function runRules(code) {
  return checkDesign(String(code ?? ''))
}

export function summarizeHits(hits) {
  const graded = [...new Set(hits.filter((h) => GRADED_SET.has(h.code)).map((h) => h.code))].sort()
  return { graded, strictPass: graded.length === 0 }
}

export function strictVerdict(graded) {
  return graded.length ? `STRICT: FAIL (${graded.join(', ')})` : 'STRICT: PASS (no graded patterns)'
}

const patternForHit = (h) => byCode[String(h.code).toLowerCase()] || null

export function findingJson(h) {
  const p = patternForHit(h)
  return {
    code: h.code,
    id: h.id || (p && p.id) || '',
    name: h.name,
    oneLiner: p ? p.oneLiner : '',
    category: p ? p.category : '',
    confidence: h.confidence,
    graded: GRADED_SET.has(h.code),
    evidence: h.evidence,
    fix: h.fix,
    url: p ? urlFor(p) : 'https://sloppatterns.com/',
  }
}

export function findingText(h) {
  const p = patternForHit(h)
  const more = p ? urlFor(p) : 'https://sloppatterns.com/'
  return `${h.code}  ${h.name}${GRADED_SET.has(h.code) ? ' [graded]' : ''}\n  Found: ${h.evidence.join('\n         ')}\n  Fix:   ${h.fix}\n  More:  ${more}`
}

export function findPattern(key) {
  const k = String(key ?? '').toLowerCase()
  return byId[k] || byCode[k] || null
}

function analyzeSnippet(code) {
  const text = String(code ?? '')
  if (text.length > MAX_SNIPPET) {
    return { error: 'That is more than 300 KB of code. Send one page or component at a time.' }
  }
  return { hits: checkDesign(text) }
}

export function checkDesignText(code, options = {}) {
  const result = analyzeSnippet(code)
  if (result.error) return result.error
  const hits = result.hits
  const strict = options.strict === true
  if (!hits.length) {
    const clean = `No documented slop patterns detected.\n\nChecked against the ${RULES.length} patterns with mechanical tells (Slop Patterns v${LIB.version}). This is not a clean bill of health — ${PATTERNS.length - CHECKED} of the ${PATTERNS.length} patterns in the library need a rendered page or a human read and are never flagged here.`
    return strict ? `${clean}\n\n${strictVerdict([])}` : clean
  }
  const sure = hits.filter((h) => h.confidence !== 'review')
  const maybe = hits.filter((h) => h.confidence === 'review')
  const body = sure.map(findingText).join('\n\n') + (maybe.length
    ? `${sure.length ? '\n\n' : ''}WORTH A LOOK (this is a whole page; these rules have not yet passed our hand audit on whole pages, so check before acting)\n\n${maybe.map(findingText).join('\n\n')}`
    : '')
  const graded = summarizeHits(hits).graded
  return `${sure.length} pattern${sure.length === 1 ? '' : 's'} detected${maybe.length ? `, ${maybe.length} more worth a look` : ''}.\n\n${body}\n\n---\nChecked against ${CHECKED} of ${PATTERNS.length} documented patterns (the ones with a mechanical tell), Slop Patterns v${LIB.version}. The other ${PATTERNS.length - CHECKED} need a rendered page or human judgement.${strict ? `\n\n${strictVerdict(graded)}` : ''}`
}

export function checkDesignJson(code) {
  const result = analyzeSnippet(code)
  if (result.error) {
    return JSON.stringify({ source: 'snippet', error: result.error, library: libraryInfo() }, null, 2)
  }
  const summary = summarizeHits(result.hits)
  return JSON.stringify({
    source: 'snippet',
    clean: result.hits.length === 0,
    hits: result.hits.map(findingJson),
    graded: summary.graded,
    strictPass: summary.strictPass,
    library: libraryInfo(),
  }, null, 2)
}

export function listPatternsText(track) {
  const list = PATTERNS.filter((p) => !track || p.track === track)
  return list.map((p) => `${p.code}\t${p.id}\t${p.name} — ${p.oneLiner}`).join('\n')
    + `\n\n${list.length} patterns.`
}

export function listPatternsJson(track) {
  const list = PATTERNS.filter((p) => !track || p.track === track)
  return JSON.stringify(list.map((p) => ({
    code: p.code,
    id: p.id,
    name: p.name,
    oneLiner: p.oneLiner,
    category: p.category,
    track: p.track,
    url: urlFor(p),
  })), null, 2)
}

function queryWords(query) {
  return String(query ?? '').toLowerCase().split(/\W+/).filter((w) => w.length > 2)
}

function rankPatterns(list, query, extraFields = []) {
  const words = queryWords(query)
  if (!words.length) return []
  return list.map((p) => {
    const hay = [p.name, p.oneLiner, p.looksLike, p.why, p.group, p.theFix, ...extraFields.map((f) => p[f])].join(' ').toLowerCase()
    const head = `${p.name} ${p.oneLiner}`.toLowerCase()
    let score = 0
    for (const w of words) {
      if (hay.includes(w)) score++
      if (head.includes(w)) score++
      if (p.name.toLowerCase().includes(w)) score += 2
    }
    for (let i = 0; i + 1 < words.length; i++) {
      if (head.includes(`${words[i]} ${words[i + 1]}`)) score += 3
    }
    return { p, score }
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score)
}

const patternLine = (p) => `${p.code}\t${p.id}\t${p.name} — ${p.oneLiner}`

export function searchPatternsText(query) {
  if (!queryWords(query).length) return 'Empty query.'
  const scored = rankPatterns(PATTERNS, query).slice(0, 8)
  if (!scored.length) return 'No match. Try slop_list_patterns for the full taxonomy.'
  return scored.map((x) => patternLine(x.p)).join('\n')
}

export function reviewPatternsText(query, options = {}) {
  const limit = Math.min(Math.max(Number(options.limit) || 6, 1), 20)
  if (!queryWords(query).length) return 'Empty query.'
  const pool = PATTERNS.filter((p) => !CHECKED_CODES.has(p.code) && (!options.track || p.track === options.track))
  const scored = rankPatterns(pool, query, ['heur']).slice(0, limit)
  if (!scored.length) {
    return `No match among the ${pool.length} patterns that need human review. Try other keywords, or slop_list_patterns for the full taxonomy.`
  }
  return scored.map((x) => patternLine(x.p)).join('\n')
    + `\n\n${scored.length} of ${pool.length} patterns that no code check can flag.`
    + ' Call slop_get_pattern with the id for the fix and the review steps.'
}

export function reviewPatternsJson(query, options = {}) {
  const limit = Math.min(Math.max(Number(options.limit) || 6, 1), 20)
  const pool = PATTERNS.filter((p) => !CHECKED_CODES.has(p.code) && (!options.track || p.track === options.track))
  const scored = queryWords(query).length ? rankPatterns(pool, query, ['heur']).slice(0, limit) : []
  return JSON.stringify({
    query: String(query ?? ''),
    count: scored.length,
    reviewable: pool.length,
    patterns: scored.map(({ p }) => ({
      code: p.code,
      id: p.id,
      name: p.name,
      oneLiner: p.oneLiner,
      track: p.track,
      category: p.category,
      url: urlFor(p),
    })),
  }, null, 2)
}

export function getPatternText(id) {
  const p = findPattern(id)
  if (!p) return `No pattern "${id}". Use slop_list_patterns to see valid ids and codes.`
  return [
    `${p.code}  ${p.name}`, p.oneLiner, '',
    `TRACK    ${p.track} · ${p.group}`,
    `ORIGIN   ${p.origin}`,
    `HARM     ${p.harm}`, '',
    `LOOKS LIKE\n${p.looksLike}`, '',
    `WHY IT HAPPENS\n${p.why}`, '',
    `WHO IT HURTS\n${p.who}`, '',
    `THE FIX\n${p.theFix}`, '',
    `DETECTION HEURISTIC\n${p.heur}`,
    p.sightings ? `\nSIGHTINGS\n${p.sightings}` : '',
    (p.sources && p.sources.length) ? `\nSOURCES\n${p.sources.map((s) => `- ${s.t || s.title} — ${s.u || s.url}`).join('\n')}` : '',
    `\nENTRY    v${p.version} · added ${p.added} · updated ${p.updated} · detection: ${p.detect === 'code' ? 'automated (slop_check_design or slop_scan_path)' : p.detect === 'render' ? 'needs a rendered page' : 'human judgement'} · evidence: ${p.tier}`,
    `https://sloppatterns.com/#${p.id}`,
  ].filter(Boolean).join('\n')
}

export function whyText(id) {
  const p = findPattern(id)
  if (!p) return `No pattern "${id}".`
  return `${p.code} ${p.name}\n\n${p.why}`
}

export function changelogText() {
  const c = LIB.counts
  return [
    `Slop Patterns v${LIB.version} (released ${LIB.released}) · ${c.patterns} patterns · ${c.detectableFromCode} detected from code · ${c.sourced} sourced, ${c.practitionerObserved} practitioner-observed, ${c.evidenceNeeded} evidence needed · ${c.sourceLinks} source links`, '',
    ...LIB.changelog.map((r) => [
      `v${r.version} — ${r.date}`,
      ...(r.added.length ? ['  Added:', ...r.added.map((x) => `   + ${x}`)] : []),
      ...(r.changed.length ? ['  Changed:', ...r.changed.map((x) => `   ~ ${x}`)] : []),
      r.notes ? `  ${r.notes}` : '',
    ].filter(Boolean).join('\n')),
    '', `Versioning: ${LIB.versioning.library}`, LIB.versioning.pattern, LIB.versioning.ids,
  ].join('\n')
}