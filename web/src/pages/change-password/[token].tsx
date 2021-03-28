//_______________________________________________________________
//                            IMPORTS
//_______________________________________________________________
import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
// import router from 'next/router';
import React from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import login from '../login';
import { useRouter } from 'next/router';
//_______________________________________________________________
//                      CHANGE PASSWORD PAGE
//_______________________________________________________________

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ newPassword: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await changePassword({
						newPassword: values.newPassword,
						token,
					});
					if (response.data?.changePassword.errors) {
						setErrors(toErrorMap(response.data.changePassword.errors));
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
							label="New password:"
							type="password"
						/>
						<Button
							mt="4"
							isLoading={isSubmitting}
							type="submit"
							color="white"
							backgroundColor="teal"
						>
							create new password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

ChangePassword.getInitialProps = ({ query }) => {
	return {
		token: query.token as string,
	};
};

export default ChangePassword;
function useRouter() {
	throw new Error('Function not implemented.');
}
