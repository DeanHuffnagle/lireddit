import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import theme from '../theme';

function MyApp({ Component, pageProps }: any) {
	return (
		<ChakraProvider resetCSS theme={theme}>
			<Component {...pageProps} />
		</ChakraProvider>
	);
}

export default MyApp;
