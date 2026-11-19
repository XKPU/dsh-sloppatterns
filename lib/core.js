import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { checkDesign, RULES } = require('../vendor/slop-patterns/rules.js')
const PATTERNS = require('../vendor/slop-patterns/patterns.json')
const LIB = require('../vendor/slop-patterns/library.json')

const CHECKED = PATTERNS.filter((p) => RULES.some((r) => r.code === p.code)).length
const byId = Object.fromEntries(PATTERNS.map((p) => [p.id, p]))
const byCode = Object.fromEntries(PATTERNS.map((p) => [p.code.toLowerCase(), p]))

export const meta = {
  version: LIB.version,
  released: LIB.released,
  patterns: PATTERNS.length,
  rules: RULES.length,
  checked: CHECKED,
}

export function findPattern(key) {
  const k = String(key ?? '').toLowerCase()
  return byId[k] || byCode[k] || null
}

export function checkDesignText(code) {
  const text = String(code ?? '')
  if (text.length > 300000) return 'That is more than 300 KB of code. Send one page or component at a time.'
  const hits = checkDesign(text)
  if (!hits.length) {
    return `No documented slop patterns detected.\n\nChecked against the ${RULES.length} patterns with mechanical tells (Slop Patterns v${LIB.version}). This is not a clean bill of health — ${PATTERNS.length - CHECKED} of the ${PATTERNS.length} patterns in the library need a rendered page or a human read and are never flagged here.`
  }
  const fmt = (h) => `${h.code}  ${h.name}\n  Found: ${h.evidence.join('\n         ')}\n  Fix:   ${h.fix}\n  More:  https://sloppatterns.com/#${h.id}`
  const sure = hits.filter((h) => h.confidence !== 'review')
  const maybe = hits.filter((h) => h.confidence === 'review')
  const body = sure.map(fmt).join('\n\n') + (maybe.length
    ? `${sure.length ? '\n\n' : ''}WORTH A LOOK (this is a whole page; these rules have not yet passed our hand audit on whole pages, so check before acting)\n\n${maybe.map(fmt).join('\n\n')}`
    : '')
  return `${sure.length} pattern${sure.length === 1 ? '' : 's'} detected${maybe.length ? `, ${maybe.length} more worth a look` : ''}.\n\n${body}\n\n---\nChecked against ${CHECKED} of ${PATTERNS.length} documented patterns (the ones with a mechanical tell), Slop Patterns v${LIB.version}. The other ${PATTERNS.length - CHECKED} need a rendered page or human judgement.`
}

export function listPatternsText(track) {
  const list = PATTERNS.filter((p) => !track || p.track === track)
  return list.map((p) => `${p.code}\t${p.id}\t${p.name} — ${p.oneLiner}`).join('\n')
    + `\n\n${list.length} patterns.`
}

export function searchPatternsText(query) {
  const words = String(query ?? '').toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  if (!words.length) return 'Empty query.'
  const scored = PATTERNS.map((p) => {
    const hay = [p.name, p.oneLiner, p.looksLike, p.why, p.group, p.theFix].join(' ').toLowerCase()
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
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 8)
  if (!scored.length) return 'No match. Try list_patterns for the full taxonomy.'
  return scored.map((x) => `${x.p.code}\t${x.p.id}\t${x.p.name} — ${x.p.oneLiner}`).join('\n')
}

export function getPatternText(id) {
  const p = findPattern(id)
  if (!p) return `No pattern "${id}". Use list_patterns to see valid ids and codes.`
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
    `\nENTRY    v${p.version} · added ${p.added} · updated ${p.updated} · detection: ${p.detect === 'code' ? 'automated (check_design)' : p.detect === 'render' ? 'needs a rendered page' : 'human judgement'} · evidence: ${p.tier}`,
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