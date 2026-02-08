import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

import { fetchPdbTitles, searchPdbIds } from './api'

type Molecule = { id: string; title: string }

export const searchMolecules = createAsyncThunk(
  'search/searchMolecules',
  async (query: string | undefined, { getState, signal }) => {
    const state = (getState() as RootState).search
    const actualQuery = query ?? state.query
    // If query is undefined, it means we are loading more molecules, so we start from the end of the current list
    const start = query !== undefined ? 0 : state.molecules.length

    const { ids, totalCount } = await searchPdbIds(actualQuery, start, {
      signal
    })
    const titles = await fetchPdbTitles(ids, { signal })

    return {
      molecules: ids.map((id, index) => ({ id, title: titles[index] })),
      totalCount
    }
  }
)

const initialState = {
  query: '',
  status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  molecules: [] as Molecule[],
  totalCount: 0,
  hasMore: false
}

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.molecules = []
      state.status = 'idle'
      state.totalCount = 0
      state.hasMore = false
      state.query = ''
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMolecules.pending, (state, action) => {
        const isNewSearch = action.meta.arg !== undefined
        if (isNewSearch) {
          state.query = action.meta.arg!
          state.status = 'loading'
        } else {
          state.status = 'loading'
        }
      })
      .addCase(searchMolecules.fulfilled, (state, action) => {
        const isNewSearch = action.meta.arg !== undefined
        if (isNewSearch) {
          state.molecules = action.payload.molecules
          state.status = 'succeeded'
        } else {
          state.molecules.push(...action.payload.molecules)
          state.status = 'succeeded'
        }
        state.totalCount = action.payload.totalCount
        state.hasMore = state.molecules.length < action.payload.totalCount
      })
      .addCase(searchMolecules.rejected, (state, action) => {
        if (action.meta?.aborted) return
        if (action.meta.arg !== undefined) {
          state.molecules = []
          state.status = 'failed'
        } else {
          state.status = 'succeeded'
        }
      })
  }
})

export const { clearSearch } = searchSlice.actions

export default searchSlice.reducer
