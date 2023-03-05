import {useNavigate} from "react-router-dom"
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import authService from '../../service/auth';
import { Box, Button, Input } from "@mui/material";
import userService from "../../service/users";
import * as Yup from "yup";

const SetAvatarForm = () => {
    const navigate = useNavigate();

    const user = authService.getUser();
    if(!user) {
        navigate("/login");
        return null;
    }


    const formik = useFormik<{file: File | null}>({
        initialValues: {
            file: null,
        },

        onSubmit: async (data) => {
            const file = data.file as File;
            if(!file) formik.errors.file = "File is required.";
            try{
                await userService.changeAvatar(user._id, file);
                formik.resetForm();
            }catch(ex) {
                const error = ex as AxiosError;
                if(error.response?.status === 400) formik.errors.file = error.response.data as string;
            }

        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        formik.setFieldValue("file", e.currentTarget.files?.[0]);
    };

    return (
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{display: "flex", flexDirection: "column",mt: 1 }}>
            <Input 
                type="file"
                name="file"
                onChange={handleFileChange}
            />
            {formik.touched.file && formik.errors.file && <div>{formik.errors.file}</div>}
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
            >
                Set Avatar
            </Button>
        </Box>
    );
}

export default SetAvatarForm;