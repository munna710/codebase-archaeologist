import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function ChartDisplay({ projects }) {
  const data = projects.map((p) => ({
    name: p.projectName.length > 15 ? p.projectName.slice(0, 15) + '...' : p.projectName,
    classes: p.classCount,
  }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" fontSize={12} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="classes" fill="#7ea2ef" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartDisplay;