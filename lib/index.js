import { defineTool } from '@deepseek-ai/dsh-tools'
import {
  changelogText,
  checkDesignText,
  getPatternText,
  listPatternsText,
  meta,
  searchPatternsText,
  whyText,
} from './core.js'

export const name = 'dsh-sloppatterns'

export const inject = ['tools']

const output = (_args, value) => [{ type: 'text', text: value }]
const outputSchema = { schema: { type: 'string' }, render: output }

export function apply(ctx) {
  ctx.effect(() => {
    const disposers = [
      ctx.tools.register(defineTool({
        name: 'slop_check_design',
        description: 'Check a CSS, HTML or JSX snippet against the Slop Patterns library and return every AI design anti-pattern it matches, with the fix for each. Runs offline against the vendored rules and covers the patterns that have a mechanical tell. Useful for reviewing generated UI code before shipping.',
        parameters: {
          code: {
            type: 'string',
            required: true,
            description: 'The CSS, HTML or JSX to check. Paste it whole; partial snippets work but full files are more accurate.',
          },
        },
        output: outputSchema,
        async execute(args, exec) {
          exec.signal.throwIfAborted()
          return checkDesignText(args.code)
        },
      })),
      ctx.tools.register(defineTool({
        name: 'slop_list_patterns',
        description: 'List the whole Slop Patterns taxonomy: code, id, name and one-liner for every documented AI design anti-pattern. Optionally filter by track.',
        parameters: {
          track: {
            type: 'string',
            enum: ['surface', 'behavioral'],
            description: 'Optional filter.',
          },
        },
        output: outputSchema,
        async execute(args, exec) {
          exec.signal.throwIfAborted()
          return listPatternsText(args.track)
        },
      })),
      ctx.tools.register(defineTool({
        name: 'slop_search_patterns',
        description: 'Plain-language search across the Slop Patterns library. Use it when you know the symptom but not the code, for example "gradient headline" returns A10 Gradient Text Headline.',
        parameters: {
          query: {
            type: 'string',
            required: true,
            description: 'Plain-language query, e.g. "three identical feature cards".',
          },
        },
        output: outputSchema,
        async execute(args, exec) {
          exec.signal.throwIfAborted()
          return searchPatternsText(args.query)
        },
      })),
      ctx.tools.register(defineTool({
        name: 'slop_get_pattern',
        description: 'Get one full Slop Patterns entry by id or code (e.g. "a1" or "the-unchosen-gradient"): what it looks like, why tools produce it, who it hurts, the fix, sources and the detection heuristic.',
        parameters: {
          id: {
            type: 'string',
            required: true,
            description: 'Pattern id or code.',
          },
        },
        output: outputSchema,
        async execute(args, exec) {
          exec.signal.throwIfAborted()
          return getPatternText(args.id)
        },
      })),
      ctx.tools.register(defineTool({
        name: 'slop_why',
        description: 'Return only the causal explanation for one Slop Patterns entry — which model, tool or template default produces it.',
        parameters: {
          id: {
            type: 'string',
            required: true,
            description: 'Pattern id or code.',
          },
        },
        output: outputSchema,
        async execute(args, exec) {
          exec.signal.throwIfAborted()
          return whyText(args.id)
        },
      })),
      ctx.tools.register(defineTool({
        name: 'slop_changelog',
        description: 'The Slop Patterns library version, per-release changelog and versioning rules. Use it to cite a specific version of the library.',
        parameters: {},
        output: outputSchema,
        async execute(_args, exec) {
          exec.signal.throwIfAborted()
          return changelogText()
        },
      })),
    ]
    console.log(`[dsh-sloppatterns] registered ${disposers.length} tools (Slop Patterns v${meta.version})`)
    return () => {
      for (const dispose of disposers.reverse()) {
        try {
          dispose()
        } catch {}
      }
    }
  }, 'dsh-sloppatterns: tools')
}