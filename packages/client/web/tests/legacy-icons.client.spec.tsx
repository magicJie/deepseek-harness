import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import { LEGACY_ICON_EXPORTS } from '../src/legacy-icons.tsx'
import { getStaticModules } from '../src/seed.ts'

// Icon names the installed dshmarket 1.50.0 client bundle requests by their
// retired size-suffixed names; every one of them reached React as undefined
// before the compat table.
const RETIRED_MARKET_ICONS = [
  'IconCheckOutline16', 'IconChevronDownOutline14', 'IconChevronLeftOutline14',
  'IconChevronRightOutline14', 'IconChevronUpOutline14', 'IconCodeOutline16',
  'IconCordisPluginOutline14', 'IconDownloadOutline16', 'IconFolderOpen16',
  'IconFullscreenOutline16', 'IconLinkOutline14', 'IconLoadingOutline16',
  'IconQuestionOutline14', 'IconRefreshOutline14', 'IconSearchOutline16',
  'IconSparkle16', 'IconWarningOutline16',
] as const

const legacyEntries = Object.entries(LEGACY_ICON_EXPORTS)

/** Rendered edge of the single svg an icon draws, or undefined when it has none. */
function height(markup: string): string | undefined {
  // The size prop always sets the height; the tree-corner glyph is not square.
  return /<svg[^>]*? height="(\d+)"/.exec(markup)?.[1]
}

describe('retired icon names for third-party bundles', () => {
  it('covers the whole pre-rename icon surface', () => {
    expect(legacyEntries.length).toBe(81)
    expect(Object.keys(LEGACY_ICON_EXPORTS)).toEqual(expect.arrayContaining([...RETIRED_MARKET_ICONS]))
  })

  it('stays out of the package barrel', () => {
    for (const [name] of legacyEntries) expect(primitives).not.toHaveProperty(name)
  })

  it('seeds the aliases into the module-table entry bundles require', () => {
    const seeded = getStaticModules()['@deepseek-ai/dsh-client-ui-primitives'] as Record<string, unknown>
    expect(seeded.IconSearchOutlineRegular).toBeTypeOf('function')
    for (const [name, Icon] of legacyEntries) expect(seeded[name]).toBe(Icon)
  })

  it.each(legacyEntries)('%s renders and honours an explicit size', (name, Icon) => {
    expect(height(renderToStaticMarkup(<Icon />)), name).toBeDefined()
    expect(height(renderToStaticMarkup(<Icon size={24} />)), name).toBe('24')
  })

  it('keeps the square edge each retired name carried', () => {
    const edges = {
      IconSearchOutline16: 16,
      IconChevronDownOutline14: 14,
      IconTreeCorner8x10: 10,
      IconRightUpOutline14: 8,
      IconWarningOutline16: 14,
      IconArchiveOutline20: 20,
      IconInspectOutline12: 12,
    }
    for (const [name, edge] of Object.entries(edges)) {
      const Icon = LEGACY_ICON_EXPORTS[name as keyof typeof LEGACY_ICON_EXPORTS]
      expect(height(renderToStaticMarkup(<Icon />)), name).toBe(String(edge))
    }
  })
})
