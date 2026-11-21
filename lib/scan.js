import fs from 'node:fs'
import path from 'node:path'
import {
  findingJson,
  findingText,
  libraryInfo,
  runRules,
  strictVerdict,
  summarizeHits,
} from './core.js'

const DEFAULT_MAX_FILES = 200
const MAX_FILES_LIMIT = 1000
const MAX_FILE_BYTES = 2 * 1024 * 1024
const MAX_TOTAL_BYTES = 20 * 1024 * 1024
const MAX_CSS_BYTES = 2 * 1024 * 1024

function displayPath(abs) {
  const rel = path.relative(process.cwd(), abs)
  const shown = rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? rel : abs
  return shown.split(path.sep).join('/')
}

function maxFilesOption(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return DEFAULT_MAX_FILES
  return Math.min(MAX_FILES_LIMIT, Math.max(1, Math.floor(n)))
}

function collectHtml(root, maxFiles, signal) {
  const files = []
  let truncated = false
  const walk = (dir) => {
    signal?.throwIfAborted?.()
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      signal?.throwIfAborted?.()
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      if (entry.isSymbolicLink()) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        if (truncated) return
      } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
        if (files.length >= maxFiles) {
          truncated = true
          return
        }
        files.push(full)
      }
    }
  }
  walk(root)
  return { files, truncated }
}

function inlineLinkedCss(file, html) {
  return html.replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, (tag) => {
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1]
    if (!href || /^(?:https?:)?\/\//i.test(href) || /^(?:data|file):/i.test(href)) return tag
    const clean = href.split(/[?#]/)[0].replace(/^\/+/, '')
    if (!clean) return tag
    const cssPath = path.resolve(path.dirname(file), clean)
    try {
      const stat = fs.statSync(cssPath)
      if (!stat.isFile() || stat.size > MAX_CSS_BYTES) return tag
      return `<style>${fs.readFileSync(cssPath, 'utf8')}</style>`
    } catch {
      return tag
    }
  })
}

function scanPath(target, options = {}) {
  const raw = String(target ?? '').trim()
  if (!raw) return { error: 'Provide a file or directory path.' }
  const abs = path.resolve(raw)
  let stat
  try {
    stat = fs.statSync(abs)
  } catch {
    return { error: `Path not found: ${displayPath(abs)}` }
  }
  const maxFiles = maxFilesOption(options.maxFiles)
  let candidates
  let truncated = false
  if (stat.isFile()) {
    candidates = [abs]
  } else if (stat.isDirectory()) {
    ({ files: candidates, truncated } = collectHtml(abs, maxFiles, options.signal))
  } else {
    return { error: `Path is not a regular file or directory: ${displayPath(abs)}` }
  }

  const results = []
  const skipped = []
  let bytes = 0
  for (const file of candidates) {
    options.signal?.throwIfAborted?.()
    let fileStat
    try {
      fileStat = fs.statSync(file)
    } catch {
      skipped.push({ file: displayPath(file), reason: 'could not read file metadata' })
      continue
    }
    if (fileStat.size > MAX_FILE_BYTES) {
      skipped.push({ file: displayPath(file), reason: `larger than ${MAX_FILE_BYTES} bytes` })
      continue
    }
    if (bytes + fileStat.size > MAX_TOTAL_BYTES) {
      skipped.push({ file: displayPath(file), reason: 'total scan size limit reached' })
      continue
    }
    let html
    try {
      html = fs.readFileSync(file, 'utf8')
    } catch {
      skipped.push({ file: displayPath(file), reason: 'could not read file' })
      continue
    }
    bytes += fileStat.size
    const hits = runRules(inlineLinkedCss(file, html.replace(/^\uFEFF/, '')))
    results.push({ file: displayPath(file), hits })
  }

  const allHits = results.flatMap((r) => r.hits)
  const summary = summarizeHits(allHits)
  const withFindings = results.filter((r) => r.hits.length).length
  return {
    target: displayPath(abs),
    maxFiles,
    filesScanned: results.length,
    filesClean: results.length - withFindings,
    filesWithFindings: withFindings,
    hits: allHits.length,
    graded: summary.graded,
    strictPass: summary.strictPass,
    truncated,
    skipped,
    results,
  }
}

export function scanPathText(target, options = {}) {
  const scan = scanPath(target, options)
  if (scan.error) return scan.error
  const strict = options.strict === true
  const lines = []
  if (!scan.filesScanned) {
    lines.push(`No .html files found in ${scan.target}.`)
  } else {
    const plural = scan.filesScanned === 1 ? '' : 's'
    const hitPlural = scan.hits === 1 ? '' : 's'
    lines.push(`Scanned ${scan.filesScanned} file${plural} in ${scan.target}: ${scan.filesClean} clean, ${scan.filesWithFindings} with findings, ${scan.hits} hit${hitPlural}.`)
  }
  if (scan.truncated) lines.push(`Stopped after ${scan.maxFiles} HTML file${scan.maxFiles === 1 ? '' : 's'} (maxFiles).`)
  if (scan.skipped.length) {
    lines.push(`Skipped ${scan.skipped.length} file${scan.skipped.length === 1 ? '' : 's'}:`)
    for (const item of scan.skipped.slice(0, 10)) lines.push(`  ${item.file} — ${item.reason}`)
    if (scan.skipped.length > 10) lines.push(`  ... and ${scan.skipped.length - 10} more.`)
  }
  if (scan.graded.length) lines.push(`Graded patterns: ${scan.graded.join(', ')}.`)
  if (scan.filesScanned && !scan.hits) lines.push('No documented slop patterns detected.')
  if (strict) lines.push(strictVerdict(scan.graded))

  for (const result of scan.results) {
    if (!result.hits.length) continue
    lines.push('', result.file)
    for (const hit of result.hits) {
      for (const line of findingText(hit).split('\n')) lines.push(`  ${line}`)
    }
  }

  if (scan.filesScanned) {
    const lib = libraryInfo()
    lines.push('', `Checked against ${lib.checked} of ${lib.patterns} documented patterns (the ones with a mechanical tell), Slop Patterns v${lib.version}. The other ${lib.patterns - lib.checked} need a rendered page or human judgement.`)
  }
  return lines.join('\n')
}

export function scanPathJson(target, options = {}) {
  const scan = scanPath(target, options)
  if (scan.error) {
    return JSON.stringify({ target: String(target ?? ''), error: scan.error, library: libraryInfo() }, null, 2)
  }
  return JSON.stringify({
    target: scan.target,
    maxFiles: scan.maxFiles,
    filesScanned: scan.filesScanned,
    filesClean: scan.filesClean,
    filesWithFindings: scan.filesWithFindings,
    hits: scan.hits,
    graded: scan.graded,
    strictPass: scan.strictPass,
    truncated: scan.truncated,
    skipped: scan.skipped,
    results: scan.results.map((r) => ({ file: r.file, hits: r.hits.map(findingJson) })),
    library: libraryInfo(),
  }, null, 2)
}
