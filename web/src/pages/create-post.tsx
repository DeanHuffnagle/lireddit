import { Box, Flex, Link, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';

const CreatePost: React.FC = ({}) => {
	const router = useRouter();
	const [{}, createPost] = useCreatePostMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await createPost(values);
					router.push('/');
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="title"
							placeholder="interesting title"
							label="Title:"
						/>
						<Box mt="4">
							<InputField
								textarea
								name="text"
								placeholder="text..."
								label="Body:"
							/>
						</Box>
						<Button
							mt="4"
							isLoading={isSubmitting}
							type="submit"
							color="white"
							backgroundColor="teal"
						>
							create post
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(CreatePost);
