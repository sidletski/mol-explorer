import { gql } from '@apollo/client'

import { graphqlClient } from '@/api/graphql/client'
import { type RequestOptions } from '@/api/search'

export type EntryDetail = {
  id: string
  title: string
  resolution: number | null
  molecularWeight: number | null
  experimentalMethod: string | null
  polymerMonomerCount: number | null
}

type FetchEntryDetailsResponse = {
  entries: {
    rcsb_id: string
    rcsb_entry_info: {
      resolution_combined: number[] | null
      molecular_weight: number | null
      experimental_method: string | null
      deposited_polymer_monomer_count: number | null
    }
    polymer_entities: {
      rcsb_polymer_entity: {
        pdbx_description: string
      }
    }[]
  }[]
}

export const fetchEntryDetails = async (
  pdbIds: string[],
  options?: RequestOptions
): Promise<EntryDetail[]> => {
  try {
    const { data } = await graphqlClient.query<FetchEntryDetailsResponse>({
      query: gql`
        query explore_entries($search: [String!]!) {
          entries(entry_ids: $search) {
            rcsb_id
            rcsb_entry_info {
              resolution_combined
              molecular_weight
              experimental_method
              deposited_polymer_monomer_count
            }
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
      data?.entries.map((entry) => ({
        id: entry.rcsb_id,
        title:
          entry.polymer_entities[0]?.rcsb_polymer_entity.pdbx_description ??
          'Unknown',
        resolution: entry.rcsb_entry_info.resolution_combined?.[0] ?? null,
        molecularWeight: entry.rcsb_entry_info.molecular_weight,
        experimentalMethod: entry.rcsb_entry_info.experimental_method,
        polymerMonomerCount:
          entry.rcsb_entry_info.deposited_polymer_monomer_count
      })) ?? []
    )
  } catch {
    return []
  }
}
