import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Users, 
  Building, 
  Trophy, 
  Swords,
  UserPlus,
  Calendar
} from 'lucide-react';

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      'new_boxer': UserPlus,
      'new_club': Building,
      'new_tournament': Trophy,
      'new_fight': Swords,
      'fight_result': Calendar,
      'user_registered': Users
    };
    
    const Icon = icons[type] || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      'new_boxer': 'bg-blue-100 text-blue-800',
      'new_club': 'bg-green-100 text-green-800',
      'new_tournament': 'bg-yellow-100 text-yellow-800',
      'new_fight': 'bg-red-100 text-red-800',
      'fight_result': 'bg-purple-100 text-purple-800',
      'user_registered': 'bg-gray-100 text-gray-800'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Datos de ejemplo si no hay actividades
  const exampleActivities = [
    {
      id: 1,
      type: 'new_boxer',
      title: 'Nuevo boxeador registrado',
      description: 'Juan Pérez se ha unido al Club Deportivo Madrid',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
    },
    {
      id: 2,
      type: 'new_tournament',
      title: 'Torneo creado',
      description: 'Campeonato Regional de Primavera 2024',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 horas atrás
    },
    {
      id: 3,
      type: 'fight_result',
      title: 'Resultado de combate',
      description: 'María García vs Ana López - Victoria por decisión',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 día atrás
    }
  ];

  const displayActivities = activities.length > 0 ? activities : exampleActivities;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          Últimas actividades en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(activity.timestamp, { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {displayActivities.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay actividad reciente para mostrar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;

