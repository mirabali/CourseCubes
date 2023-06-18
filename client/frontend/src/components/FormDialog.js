import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function FormDialog({open,setOpen, data, setData}) {

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div style={{margin: '10px'}}>
      <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogTitle>{data.data.name}</DialogTitle>
        <DialogContent>
        <TextField
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={data.data.name}
            onChange={(event) => {
              setData(data => {
                let d = {...data};
                d.data.name = event.target.value;
                return d;
              });
            }}
          />
          <CodeEditor 
            style={{
              height:'70%',
              width: '80%',
              margin: '40px',
            }}
            value={data.data.code}
            onChange={(event) => {
              setData(data => {
                let d = {...data};
                d.data.code = event.target.value;
                return d;
              });
            }}
            language="python"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Done</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
