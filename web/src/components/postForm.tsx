import * as Yup from "yup";
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { TextField, Avatar, Paper, IconButton, Box } from "@mui/material";
import postService from "../service/posts";
import authService from "../service/auth";
import SendIcon from '@mui/icons-material/Send';
import { Link } from 'react-router-dom';
import UserAvatar from "./utils/userAvatar";

const validationSchema = Yup.object().shape({
    content: Yup.string().min(2).max(1000).required(),
 });

const PostForm = ({parent, pushToWall}: {parent?: string, pushToWall(post: unknown): void}) => {
    const formik = useFormik<{content: string}>({
        initialValues: { content: "" },
        validationSchema: validationSchema,
        onSubmit: async ({content}) => {
        try {
            const {data: post} = await postService.createOne({content, parent});
            pushToWall(post);
        } catch(ex) {
            const error = ex as AxiosError;
            if(error.response?.status === 400) formik.errors.content = error.response.data as string;
        }
        },})

    const user = authService.getUser();

    return (
        <Paper elevation={12} sx={{my: 2, pb: 1}} component="form" onSubmit={formik.handleSubmit}>
        <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
        <Link to={"/users/" + user?._id}>
            <Box
            sx={{ width: 32, height: 32, fontSize: "1rem", mr: 2 }}
             >
                {user && <UserAvatar id={user._id} name={user.name}/>}
            </Box>
        </Link>
        <TextField
        name="content"
        label="new post"
        variant="standard"
        InputLabelProps={{
            shrink: true,
        }}
        maxRows="2"
        multiline
        fullWidth
        value={formik.values.content}
        onChange={formik.handleChange}
        error={formik.touched.content && Boolean(formik.errors.content)}
         helperText={formik.touched.content && formik.errors.content}
        />
        <IconButton
        component="button"
        type="submit"
        sx={{ml: 1}}
            >
            <SendIcon sx={{color: "primary.main"}}/>
        </IconButton>

        </Box>
        </Paper>
    )
};

export default PostForm;