import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { FormControlLabel, Typography } from '@mui/material';

export default function ExecutionDialog({open,setOpen, data, refresh}) {

  const handleClose = () => {
    setOpen(false);
  };

  let [refreshLocal, setRefresh] = useState(true);

  useEffect(() => {
    setRefresh(!refreshLocal);
  }, [refresh])

  return (
    <div style={{margin: '10px'}}>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{data.data.name}</DialogTitle>
        <DialogContent>
          <CodeEditor 
            style={{
              height:'200px',
              width: '500px'
            }}
            value={data.data.code}
            language="python"/>
          
          <TextField
            sx={{
              marginTop:'20px',
              visibility: data.data.running || data.data.finished ? 'visible' : 'hidden'}}
            margin="dense"
            id="name"
            label="Layer"
            type=""
            fullWidth
            multiline
            variant="standard"
            value={data.data.layer}
          />
          
          {
            data.data.args ? data.data.args.map((arg) => 
            (
              <TextField
                sx={{
                  marginTop:'20px',
                  visibility: data.data.running || data.data.finished ? 'visible' : 'hidden'}}
                margin="dense"
                id="name"
                label="Arg"
                type=""
                fullWidth
                multiline
                variant="standard"
                value={arg}
              />
            )) : ''
          }

          <TextField
            sx={{
              marginTop:'20px',
              visibility: data.data.running || data.data.finished ? 'visible' : 'hidden'}}
            margin="dense"
            id="name"
            label="Console Output"
            type=""
            fullWidth
            multiline
            variant="standard"
            value={data.data.console_output}
          />

          <TextField
            sx={{
              marginTop:'20px',
              visibility: data.data.finished ? 'visible' : 'hidden'}}
            margin="dense"
            id="name"
            label="Return Value"
            type=""
            fullWidth
            multiline
            variant="standard"
            value={data.data.return_value}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Done</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
