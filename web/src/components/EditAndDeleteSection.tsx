import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import {
	PostSnippetFragment,
	useDeletePostMutation,
	useMeQuery,
} from '../generated/graphql';

interface editAndDeleteSectionProps {
	id: number;
	creatorId: number;
}

export const EditAndDeleteSection: React.FC<editAndDeleteSectionProps> = ({
	id,
	creatorId,
}) => {
	const [, deletePost] = useDeletePostMutation();
	const [{ data: meData }] = useMeQuery();

	if (meData?.me?.id !== creatorId) {
		return null;
	}

	return (
		<Flex direction="column" justifyContent="center" alignItems="center">
			<Box mt="auto">
				<NextLink href="post/edit/[id]" as={`/post/edit/${id}`}>
					<IconButton
						as={Link}
						aria-label="edit post"
						icon={<EditIcon />}
						size="xs"
						mr={1}
					/>
				</NextLink>

				<IconButton
					aria-label="delete post"
					icon={<DeleteIcon />}
					size="xs"
					onClick={() => {
						deletePost({ id: id });
					}}
				/>
			</Box>
		</Flex>
	);
};
