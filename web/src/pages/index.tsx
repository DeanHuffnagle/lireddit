//// Imports ////
import { NavBar } from '../components/NavBar';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import React from 'react';
import { Layout } from '../components/Layout';
import {
	Box,
	Button,
	Flex,
	Heading,
	Icon,
	IconButton,
	Link,
	Stack,
	Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { UpdootSection } from '../components/UpdootSection';

//// Index ////
const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});
	const [{ data, fetching }] = usePostsQuery({
		variables,
	});
	if (!fetching && !data) {
		return <div>query failed for some reason</div>;
	}
	return (
		<Layout>
			<Flex>
				<Heading>LiReddit</Heading>
				<NextLink href="/create-post">
					<Link ml="auto">Create Post</Link>
				</NextLink>
			</Flex>
			<br />
			{fetching && !data ? (
				<div>Loading...</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.posts.map((p) => (
						<Flex key={p.id} p={5} shadow="md" borderWidth="1px">
							<UpdootSection post={p} />
							<Box>
								<Heading fontSize="xl">{p.title}</Heading>
								<text>Posted by {p.creator.username}</text>
								<Text mt={4}>{p.textSnippet}...</Text>
							</Box>
						</Flex>
					))}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
							});
						}}
						isloading={fetching}
						m="auto"
						my={8}
					>
						Load More
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
