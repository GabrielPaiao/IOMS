// ioms-frontend/src/pages/OutageCalendarPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutagesAdvanced } from '../hooks/useOutagesAdvanced';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Warning,
  CheckCircle,
  XCircle,
  ClockCounterClockwise
} from '@phosphor-icons/react';
import CriticalityBadge from '../components/outageRequests/CriticalityBadge';

export default function OutageCalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getCalendar,
    isLoading, 
    error,
    clearError 
  } = useOutagesAdvanced();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [outages, setOutages] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setIsLoadingCalendar(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const calendarData = await getCalendar({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      setOutages(calendarData);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getOutagesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return outages.filter(outage => {
      const outageDate = new Date(outage.scheduledStart);
      const outageDateString = outageDate.toISOString().split('T')[0];
      return outageDateString === dateString;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'cancelled': return <ClockCounterClockwise className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleOutageClick = (outageId: string) => {
    navigate(`/outages/${outageId}`);
  };

  if (isLoading || isLoadingCalendar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar calendário</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              clearError();
              loadCalendarData();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Calendário de Outages
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize e gerencie todas as outages programadas
              </p>
            </div>
            
            <button
              onClick={() => navigate('/new-outage')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Outage
            </button>
          </div>
        </div>

        {/* Controles do Calendário */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="px-3 py-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7">
            {/* Dias vazios no início */}
            {Array.from({ length: startingDayOfWeek }, (_, index) => (
              <div key={`empty-${index}`} className="min-h-[120px] border-r border-b border-gray-200 bg-gray-50"></div>
            ))}

            {/* Dias do mês */}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayOutages = getOutagesForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50' : ''
                  } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </span>
                    {dayOutages.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {dayOutages.length}
                      </span>
                    )}
                  </div>

                  {/* Outages do dia */}
                  <div className="space-y-1">
                    {dayOutages.slice(0, 3).map((outage) => (
                      <div
                        key={outage.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOutageClick(outage.id);
                        }}
                        className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 border-l-2 border-blue-500 bg-blue-50"
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <CriticalityBadge criticality={outage.criticality} />
                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(outage.status)}`}>
                            {getStatusIcon(outage.status)}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900 truncate">
                          {outage.reason}
                        </div>
                        <div className="text-gray-600">
                          {formatTime(outage.scheduledStart)} - {formatTime(outage.scheduledEnd)}
                        </div>
                      </div>
                    ))}
                    
                    {dayOutages.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayOutages.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel de Detalhes da Data Selecionada */}
        {selectedDate && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Outages para {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {getOutagesForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getOutagesForDate(selectedDate).map((outage) => (
                  <div
                    key={outage.id}
                    onClick={() => handleOutageClick(outage.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CriticalityBadge criticality={outage.criticality} />
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(outage.status)}`}>
                          {getStatusIcon(outage.status)}
                          <span className="ml-1 capitalize">{outage.status}</span>
                        </span>
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        {formatTime(outage.scheduledStart)} - {formatTime(outage.scheduledEnd)}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">
                      {outage.reason}
                    </h4>
                    
                    {outage.application && (
                      <p className="text-sm text-gray-600">
                        Aplicação: {outage.application.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma outage programada para esta data
              </p>
            )}
          </div>
        )}

        {/* Legenda */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Legenda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border-l-2 border-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Outage</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-sm text-gray-600">Aprovada</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span className="text-sm text-gray-600">Pendente</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-sm text-gray-600">Rejeitada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}