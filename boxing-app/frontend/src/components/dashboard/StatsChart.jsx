import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const StatsChart = ({ type = 'bar', data = [], title, description }) => {
  // Datos de ejemplo para diferentes tipos de gráficos
  const exampleData = {
    bar: [
      { name: 'Ene', combates: 12, torneos: 2 },
      { name: 'Feb', combates: 19, torneos: 3 },
      { name: 'Mar', combates: 15, torneos: 1 },
      { name: 'Abr', combates: 22, torneos: 4 },
      { name: 'May', combates: 18, torneos: 2 },
      { name: 'Jun', combates: 25, torneos: 3 }
    ],
    pie: [
      { name: 'Peso Ligero', value: 35, color: '#3B82F6' },
      { name: 'Peso Welter', value: 28, color: '#10B981' },
      { name: 'Peso Medio', value: 20, color: '#F59E0B' },
      { name: 'Peso Pesado', value: 17, color: '#EF4444' }
    ],
    line: [
      { name: 'Ene', boxeadores: 45 },
      { name: 'Feb', boxeadores: 52 },
      { name: 'Mar', boxeadores: 48 },
      { name: 'Abr', boxeadores: 61 },
      { name: 'May', boxeadores: 58 },
      { name: 'Jun', boxeadores: 67 }
    ]
  };

  const chartData = data.length > 0 ? data : exampleData[type];

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="boxeadores" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="combates" fill="#3B82F6" name="Combates" />
              <Bar dataKey="torneos" fill="#10B981" name="Torneos" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default StatsChart;

