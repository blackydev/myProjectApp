import {NavLink, useNavigate} from "react-router-dom";
import * as Yup from "yup";
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import userService from '../../service/users';
import { Button, Container, Box,TextField, Typography,Avatar} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import authService from "../../service/auth";
import userSchemas from "./user.schemas";
import TextInput from "../utils/Input";


 const SignupSchema = Yup.object().shape({
    email: userSchemas.email,
    name: userSchemas.name,
    password: userSchemas.password,
 });

const SignupForm = () => {
    const navigate = useNavigate();
    const formik = useFormik<{email:string, name:string, password: string}>({
    initialValues: { email: "", name: "",password: "" },
    validationSchema: SignupSchema,
    onSubmit: async (values) => {
      try{
        const {data: token} = await userService.signup(values);
        authService.setJwt(token);
        navigate('/');
      } catch(ex) {
        const error = ex as AxiosError;
        if(error.response?.status === 409) formik.errors.email = error.response.data as string;
        if(error.response?.status === 400) formik.errors.password = error.response.data as string;
      }
    }
      },
  );

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
            Sign Up
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextInput label="Email" name="email" formik={formik}  />
            <TextInput label="Name" name="name" formik={formik}  />
            <TextInput label="Password" name="password" type="password" formik={formik}  />

   
            <NavLink to="/login" style={{fontSize: "0.9em"}}>
              {"Do you already have an account?"}
            </NavLink>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
  );

};

export default SignupForm;