import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import userService from '../service/users';

type IProps = {
    post : {
    _id: string,
    author: string,
    content: string,
    createAt: Date,
    }
}

const Post = ({post}: IProps) => {
  const [author, setAuthor] = React.useState({_id: "", name: "", followedCount: 0, followersCount: 0});
    React.useEffect(() => {
        const asyncEff = async() => {
            const {data: user} = await userService.get(post.author)
            setAuthor(user);
        }
        asyncEff();
    }, [author])


  return (
    <Card >
      <CardHeader
        avatar={
        <Link to={"/users/" + author}>
          <Avatar 
            alt={author?.name} src={userService.getAvatarURL(author?._id)} 
            sx={{ width: 32, height: 32, fontSize: "1rem", mr: 2 }}
              />
              
        </Link>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title="Shrimp and Chorizo Paella"
        subheader="September 14, 2016"
      />
      <CardMedia
        component="img"
        height="172"
        image="https://picsum.photos/1280/720"
        loading='lazy'
        alt="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          This impressive paella is a perfect party dish and a fun meal to cook
          together with your guests. Add 1 cup of frozen peas along with the mussels,
          if you like.
        </Typography>
      </CardContent>
  
    
    </Card>
  );
}

export default Post;