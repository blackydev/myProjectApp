import { Avatar } from "@mui/material";
import userService from "../../service/users";

const UserAvatar = ({id, name}: {id: string, name: string}) => 
        <Avatar 
          alt={name} src={userService.getAvatarURL(id)} 
        />

export default UserAvatar;