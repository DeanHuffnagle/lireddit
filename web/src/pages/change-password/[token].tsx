import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';

const ChangePassword: NextPage = () => {
	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ newPassword: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await changePassword({
						newPassword: values.newPassword,
						token:
							typeof router.query.token === 'string' ? router.query.token : '',
					});
					if (response.data?.changePassword.errors) {
						const errorMap = toErrorMap(response.data.changePassword.errors);
						setErrors(errorMap);
						if ('token' in errorMap) {
							setTokenError(errorMap.token);
						}
					} else if (response.data?.changePassword.user) {
						// worked
						router.push('/');
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="newPassword"
							placeholder="new password"
							label="New Password:"
							type="password"
						/>
						{tokenError ? (
							<Flex>
								<Box color="red" mr={1}>
									{tokenError}
								</Box>
								<NextLink href="/forgot-password">
									<Link>Click here to get a new token.</Link>
								</NextLink>
							</Flex>
						) : null}
						<Button
							mt="4"
							isLoading={isSubmitting}
							type="submit"
							color="white"
							backgroundColor="teal"
						>
							Create New Password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
