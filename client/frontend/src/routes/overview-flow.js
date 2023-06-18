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


import { v4 as uuidv4 } from 'uuid';

import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

import 'reactflow/dist/style.css';
import FormDialog from '../components/FormDialog';
import EdgeForm from '../components/EdgeForm';
import { getBaseURL } from '../App';

const default_node = {
    id: 'helo',
    type: 'default',
    position: { x: 400, y: 400 },
    data: {
      label: "Untitled Function",
      data: {
        'name': 'Untitled Function',
        'is_constant': false,
        'is_db_safe': false,
        'code': "# Only cc is allowed as a shortened name\nimport coursecubes.core as cc\n\ndef foo(bar):\n  return bar"
      },
    },
  };

const initialNodes = [
  ];
  
const initialEdges = [
    //{ id: 'e1-2', source: '1', target: '2', label: 'this is an edge label' }
  ];

const minimapStyle = {
  height: 120,
};
let new_y = 0;
let new_x = 0;
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

const OverviewFlow = () => {
  const navigate = useNavigate();
  let {uuidFlow} = useParams();
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

  const addDefaultNode = () => {
    setNodes(nds => {
      let nds_new = nds.map(
        element => element
      );
      console.log(nds_new);
      let n = JSON.parse(JSON.stringify(default_node));
      n.id = uuidv4();
      n.position = {'x': new_x, 'y': new_y}
      n.data.data.id = n.id;
      
      nds_new.push(n);
      console.log(nds_new, nds_new == nodes);
      return nds_new;
    });
    console.log("AFTER CHANGE NODES IS: ", nodes);
  }

  useEffect(() => {
    fetch(getBaseURL() +  '/flowchart/' + uuidFlow)
      .then(res => res.json())
      .then(res => {
        console.log("FLOWCHART GET", res);
        setNodes(res.functions.map(
          (servernode) => ({
              id: servernode.id,
              type: 'default',
              position: servernode.position,
              data: {
                label: servernode.name,
                data: {
                  name: servernode.name,
                  is_constant: servernode.is_constant,
                  is_db_safe: servernode.is_db_safe,
                  code: servernode.code
                }
              }
          })
        ));

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
      })
  }, [])

  // For form dialog
  const [open, setOpen] = React.useState(false);
  const [data, setData] = useState({"data":{}});
  useEffect(() => {
    setNodes((nodes) => nodes.map(node => {
      if (node.selected === true) {
        let n = {...node};
        n.data = data;
        n.data.label = data.data.name;
        return n;
      } else {
        return node;
      }
    }));
  }, [data]);


  const editNode = () => {
    nodes.map(node => {
      if (node.selected === true) {
        setData(node.data);
      }
    })
    setOpen(true);
  }

  const onNodeDoubleClick = (event, node) => {
    setData(node.data);
    setOpen(true);
  }

  // For edge dialog
  const [edgeOpen, setEdgeOpen] = React.useState(false);
  const [edgeData, setEdgeData] = useState({});
  useEffect(() => {
    setEdges((edges) => edges.map(edge => {
      if (edge.selected === true) {
        let e = {...edge};
        e.data = edgeData;
        e.label = getEdgeLabel(e.data);
        return e;
      } else {
        return edge;
      }
    }));
  }, [edgeData]);


  const editEdge = () => {
    edges.map(edge => {
      if (edge.selected === true) {
        setEdgeData(edge.data);
      }
    })
    setEdgeOpen(true);
  }

  const onEdgeDoubleClick = (event, edge) => {
    setEdgeData(edge.data);
    setEdgeOpen(true);
  }

  async function save() {
    await fetch(getBaseURL() + '/flowchart/' + uuidFlow, {
      method: 'PUT',
      body: JSON.stringify({
        functions: nodes.map(node => ({...node.data.data, id:node.id, location:node.position})),
        edges: edges.map(edge => edge.data)
      })
    }).then(res => res.json())
    .then(res => {
      console.log("RES", res);
    });
  }
  const createFlowchart = () => {
    save();
  }

  const executeFlowchart = async () => {
    await save();
    await fetch(getBaseURL() + '/execution/flowchart/' + uuidFlow, {
      method: 'POST'
    }).then(res => res.json())
    .then(res => {
      let execution_uuid = res.uuid;
      console.log("REDIRECTING TO", '/execute/' + execution_uuid)
      navigate('/flow/execute/' + execution_uuid);
    })
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
      <Button onClick={addDefaultNode}>Add Node</Button>
      <Button onClick={editNode}>Edit Node</Button>
      <Button onClick={editEdge}>Edit Edge</Button>
      <Button onClick={createFlowchart}>Save</Button>
      <Button onClick={executeFlowchart}>Execute</Button>
        <ReactFlow
        nodes={nodes}
        edges={edgesWithUpdatedTypes}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
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
        <FormDialog open={open} setOpen={setOpen} data={data} setData={setData}/>
        <EdgeForm open={edgeOpen} setOpen={setEdgeOpen} data={edgeData} setData={setEdgeData}/>
    </div>
    
  );
};

export default OverviewFlow;
