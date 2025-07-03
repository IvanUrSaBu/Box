import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Swords
} from 'lucide-react';

const UpcomingEvents = ({ events = [] }) => {
  // Datos de ejemplo si no hay eventos
  const exampleEvents = [
    {
      id: 1,
      type: 'tournament',
      title: 'Campeonato Regional de Primavera',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
      location: 'Polideportivo Municipal',
      status: 'upcoming'
    },
    {
      id: 2,
      type: 'fight',
      title: 'Carlos Ruiz vs Miguel Torres',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
      location: 'Club Deportivo Central',
      status: 'confirmed',
      category: 'Peso Welter'
    },
    {
      id: 3,
      type: 'tournament',
      title: 'Copa Juvenil de Boxeo',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // En 14 días
      location: 'Centro Deportivo Norte',
      status: 'registration_open'
    }
  ];

  const displayEvents = events.length > 0 ? events : exampleEvents;

  const getEventIcon = (type) => {
    return type === 'tournament' ? Trophy : Swords;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'upcoming': { label: 'Próximo', variant: 'default' },
      'confirmed': { label: 'Confirmado', variant: 'success' },
      'registration_open': { label: 'Inscripciones Abiertas', variant: 'secondary' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
        <CardDescription>
          Combates y torneos programados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayEvents.map((event) => {
            const Icon = getEventIcon(event.type);
            
            return (
              <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h4>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(event.date, 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        
                        {event.category && (
                          <div className="flex items-center space-x-1">
                            <span>{event.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(event.status)}
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {displayEvents.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay eventos próximos programados
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;

