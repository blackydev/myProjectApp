import {redirect} from "react-router-dom"
import authService from "../service/auth";
import { Container, Grid } from '@mui/material';
import PostForm from '../components/postForm';
import { useEffect, useState } from "react";
import postService from "../service/posts";

export const loader = async () => {
    const user = authService.getUser();
    if (!user) return redirect("/login");
    return null;
};

const Home = () => {
    const [wall, setWall] = useState([]);
    useEffect(() => {
        const asyncEff = async () => {
            const { data: wall } = await postService.getWall();

        }
    })
    const pushToWall = (post: any) => {

    }

 return <Container>
            <Grid container>
                <Grid xs={3}> 
                </Grid>

                <Grid xs={6}> 
                    <PostForm pushToWall={pushToWall} />
                </Grid>

                <Grid xs={3}> 
                </Grid>
            </Grid>
        </Container>
}

export default Home;