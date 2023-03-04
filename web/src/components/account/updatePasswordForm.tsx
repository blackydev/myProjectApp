import { useState } from 'react';
import * as Yup from "yup";
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { Button, Box, TextField, Typography, Avatar, Container } from "@mui/material";
import PasswordIcon from '@mui/icons-material/Password';
import DoneIcon from '@mui/icons-material/Done';
import userSchemas from "./user.schemas";
import userService from "../../service/users";
import { useNavigate } from 'react-router-dom';
import authService from '../../service/auth';
import TextInput from '../utils/Input';

const UpdateSchema = Yup.object().shape({
    password: userSchemas.password,
 });

const UpdatePasswordForm = () => {
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const user = authService.getUser();
  if(!user) return navigate("/login");

  const formik = useFormik<{password:string}>({
    initialValues: { password: "" },
    validationSchema: UpdateSchema,
    onSubmit: async ({password}) => {
      try {
        await userService.changePassword(user._id, password);
        setSuccess(true);
      } catch(ex) {
        const error = ex as AxiosError;
        if(error.response?.status === 400) formik.errors.password = error.response.data as string;
      }
    },
  });

  const handleFormik = formik.handleChange;
  formik.handleChange = (e: any) => {
    if(success) setSuccess(false);
    handleFormik(e);
  }


    return (
       <Container maxWidth="sm">
        <Box
          sx={{
             display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
           <Avatar sx={{ m: 1, bgcolor: (success) ? "success.main" : "primary.main" }} >
            {success && <DoneIcon/>} 
            {!success && <PasswordIcon/>}
          </Avatar>
     
          <Typography component="h2" variant="h5">
            Password
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextInput label="Password" name="password" type="password" formik={formik}  />
            {         
            (!success) && 
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
            >
             Set Password
            </Button>}

            {
            (success) &&
            <Button 
              fullWidth
              sx={{ mt: 2 }}
              disableElevation
              variant="contained" 
              color="success">
              SUCCESS
            </Button>
            }

          </Box>
        </Box>
      </Container>
  );
};

export default UpdatePasswordForm;