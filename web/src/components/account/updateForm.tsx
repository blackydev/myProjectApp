import {useNavigate} from "react-router-dom"
import { useState } from 'react';
import * as Yup from "yup";
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import authService from '../../service/auth';
import { Button, Container, Box, TextField, Typography,Avatar } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import userSchemas from "./user.schemas";
import userService from "../../service/users";
import TextInput from '../utils/Input';

const validationSchema = Yup.object().shape({
    email: userSchemas.email,
    name: userSchemas.name,
 });

const UpdateForm = () => {
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const user = authService.getUser();
  if(!user) return navigate("/login");

  const formik = useFormik<{email:string, name: string}>({
    initialValues: { email: user.email, name: user.name },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const {data: token} = await userService.change(user._id, values);
        authService.setJwt(token);
        setSuccess(true);
      } catch(ex) {
        const error = ex as AxiosError;
        if(error.response?.status === 400) formik.errors.name = error.response.data as string;
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
            {!success && <EditIcon/>}
          </Avatar>

          <Typography component="h2" variant="h5">
            User
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>

            <TextInput label="Email" name="email" formik={formik}  />
            <TextInput label="Name" name="name" formik={formik}  />

            {         
            (!success) && 
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
            >
             Update Account
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

export default UpdateForm;