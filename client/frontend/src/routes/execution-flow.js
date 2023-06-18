import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType
} from 'reactflow';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";


import { v4 as uuidv4 } from 'uuid';

import { Routes, Route, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import 'reactflow/dist/style.css';
import FormDialog from '../components/FormDialog';
import EdgeForm from '../components/EdgeForm';
import ExecutionDialog from '../components/ExecutionDialog';
import { getBaseURL } from '../App';

const initialNodes = [
  ];
  
const initialEdges = [
    //{ id: 'e1-2', source: '1', target: '2', label: 'this is an edge label' }
  ];

const minimapStyle = {
  height: 120,
};

const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

const getEdgeLabel = (edgeData) => {
  if (edgeData.kind == 'REGULAR') {
    return " " + edgeData.end_index;
  }
  if (edgeData.kind == "MAP") {
    return "MAP " + edgeData.end_index;
  }

  if (edgeData.kind == "WAIT") {
    return "WAIT";
  }
  if (edgeData.kind == "SPLIT") {
    return "SPLIT " + edgeData.start_index + " TO " + edgeData.end_index;
  }
  return "test";
}

const ExecutionFlow = () => {
  let {uuidExecution} = useParams();
  //const [nodes, setNodes] = useState(initialNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((eds) => {
    console.log(params);
    params.id = uuidv4();
    params.data = {
      "id": params.id,
      'start': params.source,
      'end': params.target,
      "start_index": 0,
      "end_index": 0,
      "kind": 'REGULAR'
    };
    params.label = getEdgeLabel(params.data);
    return addEdge(params, eds);
  }), []);

  function getStyle(servernode) {
    if (servernode.errored)
      return {background: '#aa2e25', color: "#ffffff"};
    if (servernode.running)
      return {background: '#b26a00', color: '#ffffff'};
    if (servernode.finished)
      return {background: '#357a38', color: "#ffffff"};

    return {background: "#ffffff", color: "#000000"};
  }

  let [highestLayer, setHighestLayer] = useState(0);
  let [currentLayer, setCurrentLayer] = useState(0);

  useEffect(() => {
    reload()
  }, [currentLayer]);

  const navigate = useNavigate();

  async function reload() {
    await fetch(getBaseURL() + '/execution/' + uuidExecution)
      .then(res => res.json())
      .then(res => {
        console.log("FLOWCHART GET", res);
        if (res.done) {
            navigate("/presentation/edit/"+res.return_value);
        }
        setNodes(res.functions.map(
          (servernode) => ({
              id: servernode.id,
              type: 'default',
              style: getStyle(servernode),
              position: servernode.position,
              data: {
                label: servernode.name,
                data: {
                  ... servernode
                },
              }
          })
        ).filter(
          node => node.data.data.layer == currentLayer
        ));
        console.log("NODES", nodes);

        setEdges(res.edges.map(
          (serveredge) => ({
              id: serveredge.id,
              type: serveredge.kind,
              target: serveredge.end,
              source: serveredge.start,
              label: getEdgeLabel(serveredge),
              data: serveredge
          })
        ));

        setHighestLayer(res.highest_layer);
      });
  }

  const [currentCount, setCount] = useState(1);
  useEffect(() => {
    let id = setInterval(timer, 1000);
    console.log("REFRESH COUNT = ", currentCount);
    reload();
    if (id !== null)
      return () => clearInterval(id);
    else
      return () => {};
   }, [currentCount]);
   const timer = () => setCount(currentCount + 1);

  // For form dialog
  const [open, setOpen] = React.useState(false);
  const [data, setData] = useState({"data":{}});

  const onNodeDoubleClick = (event, node) => {
    setData(node.data);
    setOpen(true);
  }

  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  const edgesWithUpdatedTypes = edges.map((edge) => {
    if (edge.sourceHandle) {
      const edgeType = nodes.find((node) => node.type === 'custom').data.selects[edge.sourceHandle];
      edge.type = edgeType;
    }

    return edge;
  });

  return (
    <div style={{height:'800px'}} >
      <FormControl style={{margin: '20px', width: '100px'}}>
        <InputLabel id="demo-simple-select-label">Layer</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={currentLayer}
          label="Layer"
          onChange={(event) => setCurrentLayer(event.target.value)}
        >
          {
            [...Array(highestLayer + 1).keys()].map((layer) =>

              (<MenuItem key={layer} value={layer}>{layer}</MenuItem>)
            )
          }
        </Select>
      </FormControl>
        <ReactFlow
        nodes={nodes}
        edges={edgesWithUpdatedTypes}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        fitView
        attributionPosition="top-right"
        >
        <MiniMap style={minimapStyle} zoomable pannable />
        <Controls />
        <Background color="#aaa" gap={16} />
        </ReactFlow>
        <ExecutionDialog open={open} setOpen={setOpen} data={data} refresh={currentCount}/>
    </div>
    
  );
};

export default ExecutionFlow;
