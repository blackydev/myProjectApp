import { Box, Container, Grid, Tab, Tabs, Typography } from "@mui/material";
import SetUserForm from '../components/accountForms/setUserForm';
import SetPasswordForm from '../components/accountForms/setPasswordForm';
import SetAvatarForm from "../components/accountForms/setAvatarForm";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const Account = () => {
        const [value, setValue] = useState(0);

        const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        };

    return <Container sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Informations"  />
                        <Tab label="Password"  />
                        <Tab label="Avatar"  />
                        </Tabs>
                </Box>

                <Box sx={{maxWidth: "400px"}}>
                        <TabPanel value={value} index={0}>
                                <SetUserForm />
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                                <SetPasswordForm/>
                        </TabPanel>
                        <TabPanel value={value} index={2}>
                                <SetAvatarForm />
                        </TabPanel>
                </Box>
        </Container>
};

export default Account;