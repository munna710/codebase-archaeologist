
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from 'reactflow';

import 'reactflow/dist/style.css';

import dagre from '@dagrejs/dagre';

import { getProjectDependencies } from '../api/dependencies';

import '../theme.css';
import './login.css';
import './dependency-graph.css';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 72;

/* =========================================
   Custom Node
   ========================================= */

function ClassNode({ data }) {
  return (
    <div className="dependency-class-node">

      <Handle
        type="target"
        position={Position.Left}
      />

      <div className="dependency-class-icon">
        ◈
      </div>

      <div className="dependency-class-content">
        <div className="dependency-class-name">
          {data.label}
        </div>

        <div className="dependency-class-type">
          Java Class
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
      />

    </div>
  );
}

const nodeTypes = {
  classNode: ClassNode,
};

/* =========================================
   Dagre Layout
   ========================================= */

function createLayout(nodes, edges) {
  const graph = new dagre.graphlib.Graph();

  graph.setDefaultEdgeLabel(() => ({}));

  graph.setGraph({
    rankdir: 'LR',
    ranksep: 100,
    nodesep: 70,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    graph.setEdge(
      edge.source,
      edge.target
    );
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);

    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
    };
  });
}

/* =========================================
   Component
   ========================================= */

function DependencyGraph() {
  const { id } = useParams();

  const [dependencies, setDependencies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [nodes, setNodes, onNodesChange] =
    useNodesState([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);

  /* =========================================
     Fetch
     ========================================= */

  useEffect(() => {
    setLoading(true);
    setError(null);

    getProjectDependencies(id)
      .then((data) => {
        setDependencies(data);
      })
      .catch(() => {
        setError(
          'Failed to load dependency data.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  /* =========================================
     Create Graph
     ========================================= */

  const graphData = useMemo(() => {
    if (!dependencies.length) {
      return {
        nodes: [],
        edges: [],
      };
    }

    const classMap = new Map();

    dependencies.forEach((dep) => {
      classMap.set(
        dep.sourceClass.classId,
        dep.sourceClass.className
      );

      classMap.set(
        dep.targetClass.classId,
        dep.targetClass.className
      );
    });

    /* ---------- Edges ---------- */

    const builtEdges = dependencies.map(
      (dep) => ({
        id: `e-${dep.dependencyId}`,

        source: String(
          dep.sourceClass.classId
        ),

        target: String(
          dep.targetClass.classId
        ),

        label: dep.dependencyType,

        type: 'smoothstep',

        markerEnd: {
          type: MarkerType.ArrowClosed,
        },

        style: {
          strokeWidth: 1.5,
        },

        labelStyle: {
          fontSize: 10,
          fontWeight: 600,
        },

        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.95,
        },

        labelBgPadding: [5, 3],

        labelBgBorderRadius: 4,
      })
    );

    /* ---------- Nodes ---------- */

    const builtNodes =
      Array.from(classMap.entries()).map(
        ([classId, className]) => ({
          id: String(classId),

          type: 'classNode',

          data: {
            label: className,
          },

          position: {
            x: 0,
            y: 0,
          },

          draggable: true,
        })
      );

    /* ---------- Dagre ---------- */

    const layoutNodes = createLayout(
      builtNodes,
      builtEdges
    );

    return {
      nodes: layoutNodes,
      edges: builtEdges,
    };
  }, [dependencies]);

  /* =========================================
     Load nodes into React Flow
     ========================================= */

  useEffect(() => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  }, [
    graphData.nodes,
    graphData.edges,
    setNodes,
    setEdges,
  ]);

  /* =========================================
     Search
     ========================================= */

  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const className =
          node.data?.label || '';

        const matches =
          !search.trim() ||
          className
            .toLowerCase()
            .includes(
              search.trim().toLowerCase()
            );

        return {
          ...node,

          style: {
            opacity: matches ? 1 : 0.25,
          },
        };
      })
    );
  }, [search, setNodes]);

  /* =========================================
     Class Count
     ========================================= */

  const classCount = useMemo(() => {
    const ids = new Set();

    dependencies.forEach((dep) => {
      ids.add(dep.sourceClass.classId);
      ids.add(dep.targetClass.classId);
    });

    return ids.size;
  }, [dependencies]);

  /* =========================================
     Loading
     ========================================= */

  if (loading) {
    return (
      <main className="dependency-page">

        <header className="add-header">
          <h1 className="h2 mb-1">
            Dependency graph
          </h1>

          <p className="text-body-secondary mb-0">
            Visualize how classes in your project
            depend on each other.
          </p>
        </header>

        <div className="dependency-card card">
          <div className="card-body p-4">

            <div className="add-status">
              <span
                className="spinner-border spinner-border-sm"
                aria-hidden="true"
              />

              <span>
                Loading dependency data…
              </span>
            </div>

          </div>
        </div>

        <div
          className="scale-bar"
          aria-hidden="true"
        />

      </main>
    );
  }

  /* =========================================
     Error
     ========================================= */

  if (error) {
    return (
      <main className="dependency-page">

        <header className="add-header">
          <h1 className="h2 mb-1">
            Dependency graph
          </h1>

          <p className="text-body-secondary mb-0">
            Visualize how classes in your project
            depend on each other.
          </p>
        </header>

        <div className="dependency-card card">
          <div className="card-body p-4">

            <div className="alert alert-danger mb-0">
              {error}
            </div>

          </div>
        </div>

        <div
          className="scale-bar"
          aria-hidden="true"
        />

      </main>
    );
  }

  /* =========================================
     Empty
     ========================================= */

  if (!dependencies.length) {
    return (
      <main className="dependency-page">

        <header className="add-header">
          <h1 className="h2 mb-1">
            Dependency graph
          </h1>

          <p className="text-body-secondary mb-0">
            Visualize how classes in your project
            depend on each other.
          </p>
        </header>

        <div className="dependency-card card">
          <div className="card-body p-4">

            <div className="text-center py-5">
              <h5 className="mb-2">
                No dependencies found
              </h5>

              <p className="text-body-secondary mb-0">
                No class dependencies have been
                detected for this project.
              </p>
            </div>

          </div>
        </div>

        <div
          className="scale-bar"
          aria-hidden="true"
        />

      </main>
    );
  }

  /* =========================================
     Main
     ========================================= */

  return (
    <main className="dependency-page">

      <header className="add-header">

        <h1 className="h2 mb-1">
          Dependency graph
        </h1>

        <p className="text-body-secondary mb-0">
          Visualize how classes in your project
          depend on each other.
        </p>

      </header>

      <div className="dependency-card card">

        <div className="card-body p-4">

          {/* Stats */}

          <div className="dependency-stats">

            <div className="dependency-stat">

              <span className="dependency-stat-label">
                Classes
              </span>

              <span className="dependency-stat-value">
                {classCount}
              </span>

            </div>

            <div className="dependency-stat">

              <span className="dependency-stat-label">
                Dependencies
              </span>

              <span className="dependency-stat-value">
                {dependencies.length}
              </span>

            </div>

          </div>

          {/* Search */}

          <div className="dependency-toolbar">

            <div className="dependency-search-wrapper">

              <label
                htmlFor="dependency-search"
                className="form-label"
              >
                Search classes
              </label>

              <input
                id="dependency-search"
                type="search"
                className="form-control"
                placeholder="Search by class name..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

          </div>

          {/* Graph */}

          <div className="dependency-graph-wrapper">

            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              fitView
              fitViewOptions={{
                padding: 0.2,
              }}
              minZoom={0.15}
              maxZoom={2}
            >

              <Background
                gap={20}
                size={1}
              />

              <Controls />

              <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
              />

            </ReactFlow>

          </div>

          {/* Legend */}

          <div className="dependency-legend">

            <div className="dependency-legend-item">

              <span className="dependency-legend-node" />

              <span>
                Java class
              </span>

            </div>

            <span className="dependency-legend-arrow">
              →
            </span>

            <span>
              Dependency relationship
            </span>

          </div>

        </div>

      </div>

      <div
        className="scale-bar"
        aria-hidden="true"
      />

    </main>
  );
}

export default DependencyGraph;

