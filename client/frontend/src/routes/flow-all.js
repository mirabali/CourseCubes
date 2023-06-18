import React, { useCallback, useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';

import { getBaseURL } from '../App';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

export default function FlowAll() {

  let [items, setItems] = useState([]);
  useEffect(() => {
    fetch(getBaseURL() + '/flowchart/all')
      .then(res => res.json())
      .then(res => {
        setItems(res.items);
      });
  }, []);

  return (
    <div style={{margin: '50px'}}>
    <TableContainer component={Paper}>
      <Table  aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Solver</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <Link to={'/flow/create/'+row.id}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              </Link>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </div>
  );
}
