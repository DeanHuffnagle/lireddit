import React from 'react'
import {Formik} from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';

interface registerProps {

}


      


export const Register: React.FC<registerProps> = ({}) => {
  return (
    <Formik initialValues={{ username: "", password: "" }}
    onSubmit={{values} => {
      console.log(values);
    }}
    >
      {({values, handleChange}) => (
        <form>
          <FormControl isInvalid={form.errors.name && form.touched.name}>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input {...field} id="username" placeholder="username" />
            <FormErrorMessage>{form.errors.name}</FormErrorMessage>
          </FormControl>
        </form>

      )}
    </Formik>
  );
}

export default Register