import {NavLink, useNavigate} from "react-router-dom"
import * as Yup from "yup";
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import authService from '../../service/auth';
import { Button, Container, Box, Typography,Avatar } from "@mui/material";
import userSchemas from "./user.schemas";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TextInput from '../utils/Input';

const validationSchema = Yup.object().shape({
    email: userSchemas.email,
    password: userSchemas.password,
 });

const LoginForm = () => {
    const navigate = useNavigate();
  const formik = useFormik<{email:string, password: string}>({
    initialValues: { email: "", password: "" },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await authService.login(values);
        navigate('/');
      } catch(ex) {
        const error = ex as AxiosError;
        if(error.response?.status === 400) formik.errors.password = error.response.data as string;
      }
    },})

      const inputs = [
    {
      label: "Email",
      name: "email",
    }, 
    {
      label: "Name",
      name: "name",
    }
  ]


    return (
  <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }} >
              <PersonAddIcon/>
            </Avatar>

          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextInput label="Email" name="email" formik={formik}  />
            <TextInput label="password" name="password" type="password" formik={formik}  />
            <NavLink to="/sign-up" style={{fontSize: "0.9em"}}>
              {"Don't you have an account?"}
            </NavLink>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
            >
              Log In
            </Button>
          </Box>
        </Box>
      </Container>
    )
};

export default LoginForm;