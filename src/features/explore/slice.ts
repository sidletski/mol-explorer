import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

import { searchPdbIds } from '../search/api'
import { type EntryDetail, fetchEntryDetails } from './api'

export const exploreEntries = createAsyncThunk(
  'explore/exploreEntries',
  async (query: string | undefined, { getState, signal }) => {
    const state = (getState() as RootState).explore
    const actualQuery = query ?? state.query
    const start = query !== undefined ? 0 : state.entries.length

    const { ids, totalCount } = await searchPdbIds(actualQuery, start, {
      signal
    })
    const entries = await fetchEntryDetails(ids, { signal })

    return { entries, totalCount }
  }
)

const initialState = {
  query: '',
  status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  entries: [] as EntryDetail[],
  totalCount: 0,
  hasMore: false
}

export const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {
    clearExplore: (state) => {
      state.entries = []
      state.status = 'idle'
      state.totalCount = 0
      state.hasMore = false
      state.query = ''
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(exploreEntries.pending, (state, action) => {
        const isNewSearch = action.meta.arg !== undefined
        if (isNewSearch) {
          state.query = action.meta.arg!
        }
        state.status = 'loading'
      })
      .addCase(exploreEntries.fulfilled, (state, action) => {
        const isNewSearch = action.meta.arg !== undefined
        if (isNewSearch) {
          state.entries = action.payload.entries
        } else {
          state.entries.push(...action.payload.entries)
        }
        state.totalCount = action.payload.totalCount
        state.hasMore = state.entries.length < action.payload.totalCount
        state.status = 'succeeded'
      })
      .addCase(exploreEntries.rejected, (state, action) => {
        if (action.meta?.aborted) return
        if (action.meta.arg !== undefined) {
          state.entries = []
          state.status = 'failed'
        } else {
          state.status = 'succeeded'
        }
      })
  }
})

export const { clearExplore } = exploreSlice.actions

export default exploreSlice.reducer
