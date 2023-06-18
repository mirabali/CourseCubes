import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CodeEditor from '@uiw/react-textarea-code-editor';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function EdgeForm({open,setOpen, data, setData}) {

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event) => {
    setData(dta => {
      let d = {...dta};
      d.kind = event.target.value;
      return d;
    });
  };

  return (
    <div style={{margin: '10px'}}>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
        <FormControl fullWidth sx={{margin: '10px'}}>
          <InputLabel id="demo-simple-select-label">Kind</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={data.kind}
            label="Kind"
            onChange={handleChange}
          >
            <MenuItem value={'REGULAR'}>REGULAR</MenuItem>
            <MenuItem value={'WAIT'}>WAIT</MenuItem>
            <MenuItem value={'SPLIT'}>SPLIT</MenuItem>
            <MenuItem value={'MAP'}>MAP</MenuItem>
          </Select>
        </FormControl>

        <TextField
            sx={{visibility: data.kind == 'SPLIT'? 'visible': 'hidden'}}
            margin="dense"
            id="name"
            label="Arg From"
            type="number"
            fullWidth
            variant="standard"
            value={data.start_index}
            onChange={(event) => {
              setData(data => {
                let d = {...data};
                d.start_index = event.target.value;
                return d;
              });
            }}
          />
          <TextField
            sx={{visibility: data.kind != 'WAIT' ? 'visible': 'hidden'}}
            margin="dense"
            id="name"
            label="Arg To"
            type="number"
            fullWidth
            variant="standard"
            value={data.end_index}
            onChange={(event) => {
              setData(data => {
                let d = {...data};
                d.end_index = event.target.value;
                return d;
              });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Done</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
