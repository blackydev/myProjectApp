import {redirect} from "react-router-dom"
import authService from "../service/auth";
import { Container, Grid,Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import PostForm from '../components/postForm';
import { useEffect, useState } from "react";
import postService from "../service/posts";

const Item = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
}));

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
            setWall(wall);
        }
        asyncEff();
    }, [wall])
    const pushToWall = (post: any) => {

    }

 return <Container>
            <Grid container>
                <Grid item xs={3}> 
                </Grid>

                <Grid item xs={6}> 
                        <PostForm pushToWall={pushToWall} />
                </Grid>

                <Grid item xs={3}> 
                </Grid>
            </Grid>
        </Container>
}

export default Home;