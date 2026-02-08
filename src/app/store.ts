import { configureStore } from '@reduxjs/toolkit'

import exploreReducer from '@/features/explore/slice'
import searchReducer from '@/features/search/slice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    explore: exploreReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
