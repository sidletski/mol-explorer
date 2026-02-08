import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { fetchPdbTitles, searchPdbIds } from './api'

// Fake responses — these are what the real APIs return
const searchResponse = {
  query_id: 'test',
  result_type: 'entry',
  total_count: 3,
  result_set: [
    { identifier: '1CRN', score: 1 },
    { identifier: '4HHB', score: 0.9 },
    { identifier: '2MBW', score: 0.8 }
  ]
}

const graphqlResponse = {
  data: {
    entries: [
      {
        polymer_entities: [
          { rcsb_polymer_entity: { pdbx_description: 'CRAMBIN' } }
        ]
      },
      {
        polymer_entities: [
          { rcsb_polymer_entity: { pdbx_description: 'HEMOGLOBIN' } }
        ]
      },
      {
        polymer_entities: [
          { rcsb_polymer_entity: { pdbx_description: 'ALBUMIN' } }
        ]
      }
    ]
  }
}

// MSW handlers — intercept the two real endpoints
const server = setupServer(
  http.post('https://search.rcsb.org/rcsbsearch/v2/query', () => {
    return HttpResponse.json(searchResponse)
  }),

  http.post('https://data.rcsb.org/graphql', () => {
    return HttpResponse.json(graphqlResponse)
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('searchPdbIds', () => {
  it('returns mapped ids and totalCount', async () => {
    const result = await searchPdbIds('Cram', 0)

    expect(result).toEqual({
      ids: ['1CRN', '4HHB', '2MBW'],
      totalCount: 3
    })
  })

  it('returns empty on API error', async () => {
    server.use(
      http.post('https://search.rcsb.org/rcsbsearch/v2/query', () => {
        return HttpResponse.error()
      })
    )

    const result = await searchPdbIds('Cram', 0)

    expect(result).toEqual({ ids: [], totalCount: 0 })
  })
})

describe('fetchPdbTitles', () => {
  it('extracts titles from GraphQL response', async () => {
    const titles = await fetchPdbTitles(['1CRN', '4HHB', '2MBW'])

    expect(titles).toEqual(['CRAMBIN', 'HEMOGLOBIN', 'ALBUMIN'])
  })

  it('returns empty on API error', async () => {
    server.use(
      http.post('https://data.rcsb.org/graphql', () => {
        return HttpResponse.error()
      })
    )

    const titles = await fetchPdbTitles(['1CRN'])

    expect(titles).toEqual([])
  })
})
