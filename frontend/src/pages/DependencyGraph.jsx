import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { getProjectDependencies } from '../api/dependencies';

function DependencyGraph() {
  const { id } = useParams();
  const [dependencies, setDependencies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProjectDependencies(id)
      .then(setDependencies)
      .catch(() => setError('Failed to load dependency data.'));
  }, [id]);

  const { nodes, edges } = useMemo(() => {
    const classMap = new Map(); // classId -> class name

    dependencies.forEach((dep) => {
      classMap.set(dep.sourceClass.classId, dep.sourceClass.className);
      classMap.set(dep.targetClass.classId, dep.targetClass.className);
    });

    const classIds = Array.from(classMap.keys());

    // Simple layout: arrange nodes in a horizontal row.
    // Good enough for a small-to-medium number of classes; a real layout
    // algorithm (e.g. dagre) could improve this later for large graphs.
    const builtNodes = classIds.map((classId, index) => ({
      id: String(classId),
      data: { label: classMap.get(classId) },
      position: { x: (index % 6) * 220, y: Math.floor(index / 6) * 120 },
    }));

    const builtEdges = dependencies.map((dep) => ({
      id: `e-${dep.dependencyId}`,
      source: String(dep.sourceClass.classId),
      target: String(dep.targetClass.classId),
      label: dep.dependencyType,
      markerEnd: { type: MarkerType.ArrowClosed },
    }));

    return { nodes: builtNodes, edges: builtEdges };
  }, [dependencies]);

  if (error) return <p>{error}</p>;
  if (dependencies.length === 0) return <p>No dependencies found (or still loading).</p>;

  return (
    <div>
      <h1>Dependency Graph</h1>
      <div style={{ height: '600px', border: '1px solid #ccc' }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default DependencyGraph;