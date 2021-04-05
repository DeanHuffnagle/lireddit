//// Imports ////
import { NavBar } from '../components/NavBar';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import {
	useDeletePostMutation,
	useMeQuery,
	usePostsQuery,
} from '../generated/graphql';
import React from 'react';
import { Layout } from '../components/Layout';
import {
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Link,
	Stack,
	Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { UpdootSection } from '../components/UpdootSection';
import { EditAndDeleteSection } from '../components/EditAndDeleteSection';

//// Index ////
const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});
	const [{ data: meData }] = useMeQuery();
	const [{ data, error, fetching }] = usePostsQuery({
		variables,
	});

	const [, deletePost] = useDeletePostMutation();

	if (error) {
		return (
			<Layout>
				<div>{error?.name}</div>
				<div>{error?.message}</div>
			</Layout>
		);
	}
	return (
		<Layout>
			{fetching && !data ? (
				<div>Loading...</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.posts.map((p) =>
						!p ? null : (
							<Flex key={p.id} p={5} shadow="md" borderWidth="1px">
								<UpdootSection post={p} />
								<Box flex={1}>
									<NextLink href="post/[id]" as={`/post/${p.id}`}>
										<Link>
											<Heading fontSize="xl">{p.title}</Heading>
										</Link>
									</NextLink>
									<Text>Posted by {p.creator.username}</Text>
									<Flex>
										<Text flex={1} mt={4}>
											{p.textSnippet}...
										</Text>
									</Flex>
								</Box>

								<EditAndDeleteSection id={p.id} creatorId={p.creator.id} />
							</Flex>
						)
					)}
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
