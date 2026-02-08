import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

import { env } from '@/env'

export const graphqlClient = new ApolloClient({
  link: new HttpLink({
    uri: env.VITE_GRAPHQL_API_URL
  }),
  cache: new InMemoryCache()
})
