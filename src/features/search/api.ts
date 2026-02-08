import { gql } from '@apollo/client'

import { graphqlClient } from '@/api/graphql/client'
import { type RequestOptions, searchRequest } from '@/api/search'

export type SearchPdbIdsResponse = {
  query_id: string
  result_type: 'entry'
  total_count: number
  result_set: {
    identifier: string
    score: number
  }[]
}

export const searchPdbIds = async (
  query: string,
  start: number,
  options?: RequestOptions
) => {
  try {
    const data = await searchRequest<SearchPdbIdsResponse>('query', {
      method: 'POST',
      body: {
        query: {
          type: 'terminal',
          service: 'full_text',
          parameters: { value: query }
        },
        return_type: 'entry',
        request_options: {
          paginate: { start, rows: 10 }
        }
      },
      ...options
    })

    return {
      ids: data.result_set.map((entry) => entry.identifier),
      totalCount: data.total_count
    }
  } catch {
    return {
      ids: [],
      totalCount: 0
    }
  }
}

type FetchPdbTitlesResponse = {
  entries: {
    polymer_entities: {
      rcsb_polymer_entity: {
        pdbx_description: string
      }
    }[]
  }[]
}

export const fetchPdbTitles = async (
  pdbIds: string[],
  options?: RequestOptions
) => {
  try {
    const { data } = await graphqlClient.query<FetchPdbTitlesResponse>({
      query: gql`
        query search_entries($search: [String!]!) {
          entries(entry_ids: $search) {
            polymer_entities {
              rcsb_polymer_entity {
                pdbx_description
              }
            }
          }
        }
      `,
      variables: {
        search: pdbIds
      },
      context: {
        fetchOptions: {
          signal: options?.signal
        }
      }
    })

    return (
      data?.entries.map(
        (entry) =>
          entry.polymer_entities[0].rcsb_polymer_entity.pdbx_description
      ) ?? []
    )
  } catch {
    return []
  }
}
