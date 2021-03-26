import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import React from 'react';
import { Provider, createClient, dedupExchange, fetchExchange } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';

const client = createClient({
	url: 'http://localhost:4000/graphql',
	fetchOptions: {
		credentials: 'include',
	},
	exchanges: [dedupExchange, cacheExchange({}), fetchExchange],
});

import theme from '../theme';

function MyApp({ Component, pageProps }: any) {
	return (
		<Provider value={client}>
			<ChakraProvider resetCSS theme={theme}>
				<Component {...pageProps} />
			</ChakraProvider>
		</Provider>
	);
}

export default MyApp;
