import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { fetchEntryDetails } from './api'

const makeEntry = (
  id: string,
  title: string,
  resolution: number[] | null = [1.88],
  weight: number = 42.78
) => ({
  rcsb_id: id,
  rcsb_entry_info: {
    resolution_combined: resolution,
    molecular_weight: weight,
    experimental_method: 'X-ray',
    deposited_polymer_monomer_count: 380
  },
  polymer_entities: [
    { rcsb_polymer_entity: { pdbx_description: title } }
  ]
})

const server = setupServer(
  http.post('https://data.rcsb.org/graphql', () => {
    return HttpResponse.json({
      data: {
        entries: [
          makeEntry('2WGP', 'DUAL SPECIFICITY PROTEIN PHOSPHATASE 14'),
          makeEntry('5Y15', 'Dual specificity phosphatase 28', [2.1], 41.39),
          makeEntry('5XJV', 'Dual specificity protein phosphatase 13', [1.69], 40.72)
        ]
      }
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetchEntryDetails', () => {
  it('maps GraphQL entries to EntryDetail[]', async () => {
    const result = await fetchEntryDetails(['2WGP', '5Y15', '5XJV'])

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      id: '2WGP',
      title: 'DUAL SPECIFICITY PROTEIN PHOSPHATASE 14',
      resolution: 1.88,
      molecularWeight: 42.78,
      experimentalMethod: 'X-ray',
      polymerMonomerCount: 380
    })
  })

  it('handles null resolution_combined', async () => {
    server.use(
      http.post('https://data.rcsb.org/graphql', () =>
        HttpResponse.json({
          data: { entries: [makeEntry('2MBW', 'TEST', null, 12000)] }
        })
      )
    )

    const result = await fetchEntryDetails(['2MBW'])
    expect(result[0].resolution).toBeNull()
  })

  it('returns "Unknown" when no polymer entities', async () => {
    server.use(
      http.post('https://data.rcsb.org/graphql', () =>
        HttpResponse.json({
          data: {
            entries: [{
              rcsb_id: 'XXXX',
              rcsb_entry_info: {
                resolution_combined: [2.0],
                molecular_weight: 10000,
                experimental_method: 'X-ray',
                deposited_polymer_monomer_count: 50
              },
              polymer_entities: []
            }]
          }
        })
      )
    )

    const result = await fetchEntryDetails(['XXXX'])
    expect(result[0].title).toBe('Unknown')
  })

  it('returns empty array on API error', async () => {
    server.use(
      http.post('https://data.rcsb.org/graphql', () => HttpResponse.error())
    )

    const result = await fetchEntryDetails(['1CRN'])
    expect(result).toEqual([])
  })
})
