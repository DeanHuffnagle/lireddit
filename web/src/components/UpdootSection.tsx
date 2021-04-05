import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

export const UpdootSection: React.FC<updootSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		'updoot-loading' | 'downdoot-loading' | 'not-loading'
	>('not-loading');
	const [, vote] = useVoteMutation();
	return (
		<Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
			<IconButton
				icon={<ChevronUpIcon />}
				colorScheme={post.voteStatus === 1 ? 'green' : undefined}
				onClick={async () => {
					if (post.voteStatus === 1) {
						return;
					}
					console.log('button pressed: ');
					setLoadingState('updoot-loading');
					await vote({
						postId: post.id,
						value: 1,
					});
					setLoadingState('not-loading');
				}}
				isLoading={loadingState === 'updoot-loading'}
				aria-label="Up vote"
				size="lg"
			/>
			{post.points}
			<IconButton
				icon={<ChevronDownIcon />}
				colorScheme={post.voteStatus === -1 ? 'red' : undefined}
				onClick={async () => {
					if (post.voteStatus === -1) {
						return;
					}
					console.log('button pressed:');
					setLoadingState('downdoot-loading');
					await vote({
						postId: post.id,
						value: -1,
					});
					setLoadingState('not-loading');
				}}
				isLoading={loadingState === 'downdoot-loading'}
				aria-label="Down vote"
				size="lg"
			/>
		</Flex>
	);
};
