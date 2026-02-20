import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';

export default defineConfig({
  input: {
    path: './Geo API.yaml',
  },
  output: {
    path: './src/gen',
  },
  plugins: [
    pluginOas(),
    pluginTs(),
    pluginReactQuery({
      output: {
        path: './hooks',
      },
      group: {
        type: 'tag',
        name: ({ group }) => `${group}Hooks`,
      },
      client: {
        baseURL: process.env.VITE_API_URL,
        dataReturnType: 'full',
        client: 'fetch',
      },
      mutation: {
        methods: ['post', 'put', 'patch', 'delete'],
      },
      infinite: {
        queryParam: 'next_page',
        initialPageParam: 0,
        cursorParam: 'nextCursor',
      },
      query: {
        methods: ['get'],
        importPath: '@tanstack/react-query',
      },

      suspense: {},
    }),
  ],
});
