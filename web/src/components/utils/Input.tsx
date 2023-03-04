import { TextField } from '@mui/material';

type Props = {
    label: string,
    name: string,
    type?: string,
    formik: any,
    onChange?(e:any): void,
}

const TextInput = ({label, name, formik, type="text", onChange=formik.handleChange}: Props) => {
return <TextField
    margin="normal"
    type={type}
    required
    fullWidth
    variant="filled"
    label={label}
    name={name}
    autoFocus
    value={formik.values[name]}
    onChange={onChange}
    error={formik.touched[name] && Boolean(formik.errors[name])}
    helperText={formik.touched[name] && formik.errors[name]}
    />
}

export default TextInput;