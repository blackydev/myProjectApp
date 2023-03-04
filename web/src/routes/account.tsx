import { Container, Grid } from "@mui/material";
import UpdateForm from '../components/account/updateForm';
import UpdatePasswordForm from '../components/account/updatePasswordForm';

const Account = () => {
    return <Container>
            <Grid container spacing={2} sx={{display: "flex", flexDirection: "row"}}> 
                <Grid item xs={12} md={6}>
                        <UpdateForm />
                </Grid>
                <Grid item xs={12} md={6}>
                        <UpdatePasswordForm/>
                </Grid>
            </Grid>
            </Container>
};

export default Account;