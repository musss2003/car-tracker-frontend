import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Calendar,
  type View,
  momentLocalizer,
  type Components,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';

import { getCars } from '../../services/carService';
import { getCarAvailability } from '../../services/carService';
import { Car, BookingEvent } from '../../types/Car';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeftIcon, 
  CalendarIcon,
  RefreshIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ViewListIcon,
  ViewGridIcon
} from '@heroicons/react/solid';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const CarAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // State management
  const [car, setCar] = useState<Car | null>(null);
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [showAgenda, setShowAgenda] = useState(false);

  // Fetch car data and bookings
  const fetchCarAndBookings = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get car data first
      const cars = await getCars();
      const foundCar = cars.find((c: Car) => c.id === id);
      
      if (!foundCar) {
        setError('Vozilo nije pronađeno');
        toast.error('Vozilo nije pronađeno');
        navigate('/cars');
        return;
      }
      
      setCar(foundCar);

      // Get availability data
      const availability = await getCarAvailability(foundCar.licensePlate);
      
      // Transform availability data into calendar events
      const events: BookingEvent[] = availability.map((booking): BookingEvent => ({
        title: `Rezervacija: ${booking.customerName}`,
        start: new Date(booking.start),
        end: new Date(booking.end),
        contractId: booking.contractId,
        customerName: booking.customerName,
        customerPassportNumber: booking.customerPassportNumber,
        totalAmount: booking.totalAmount,
        status: (() => {
          const now = new Date();
          const startDate = new Date(booking.start);
          const endDate = new Date(booking.end);
          
          if (startDate.getTime() > now.getTime()) {
            return 'confirmed';
          } else if (startDate.getTime() <= now.getTime() && endDate.getTime() >= now.getTime()) {
            return 'active';
          } else {
            return 'completed';
          }
        })(),
        resource: booking
      }));

      setBookings(events);
      setError(null);
    } catch (error) {
      console.error('Error fetching car availability:', error);
      setError('Neuspješno učitavanje kalendara');
      toast.error('Neuspješno učitavanje kalendara');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchCarAndBookings();
    }
  }, [id, fetchCarAndBookings]);

  // Calendar navigation handlers
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold min-w-[200px] text-center">
          {label}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          Danas
        </Button>
        <Select value={view} onValueChange={(value: View) => onView(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mjesec</SelectItem>
            <SelectItem value="week">Sedmica</SelectItem>
            <SelectItem value="day">Dan</SelectItem>
            <SelectItem value="agenda">Lista</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAgenda(!showAgenda)}
        >
          {showAgenda ? <ViewGridIcon className="w-4 h-4" /> : <ViewListIcon className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  // Event style getter
  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = '#3174ad';
    
    if (event.status === 'confirmed') {
      backgroundColor = '#10b981'; // Green for confirmed
    } else if (event.status === 'active') {
      backgroundColor = '#f59e0b'; // Yellow for active
    } else if (event.status === 'completed') {
      backgroundColor = '#6b7280'; // Gray for completed
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Custom components for calendar
  const components: Components<BookingEvent> = {
    toolbar: CustomToolbar,
  };

  // Handle event selection
  const handleSelectEvent = (event: BookingEvent) => {
    setSelectedEvent(event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Učitavanje kalendara...</span>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Greška</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error || 'Vozilo nije pronađeno'}</p>
            <Button onClick={() => navigate('/cars')} className="w-full">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Nazad na vozila
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/cars')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Nazad
            </Button>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">
                Kalendar dostupnosti - {car.manufacturer} {car.model}
              </h1>
            </div>
          </div>
          
          <Button
            onClick={() => fetchCarAndBookings(true)}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Osvježi
          </Button>
        </div>

        {/* Car Info Card */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: car.color || '#6b7280' }}
                />
                <span className="font-medium">{car.licensePlate}</span>
              </div>
              <Badge variant="secondary">
                {car.year}
              </Badge>
              <span className="text-muted-foreground">
                {car.pricePerDay ? `${car.pricePerDay} BAM/dan` : 'Cijena nije definirana'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Ukupno rezervacija</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
          </CardContent>
        </Card>

        {showAgenda ? (
          /* Agenda View */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ViewListIcon className="w-5 h-5" />
                Lista rezervacija
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nema rezervacija za prikazivanje</p>
                </div>
              ) : (
                bookings
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .map((event, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{event.customerName}</span>
                            <Badge 
                              variant={
                                event.status === 'confirmed' ? 'default' : 
                                event.status === 'active' ? 'secondary' : 
                                'outline'
                              }
                            >
                              {event.status === 'confirmed' ? 'Potvrđeno' : 
                               event.status === 'active' ? 'Aktivno' : 'Završeno'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {moment(event.start).format('DD.MM.YYYY')} - {moment(event.end).format('DD.MM.YYYY')}
                            </div>
                            {event.totalAmount && (
                              <div className="flex items-center gap-1">
                                <CurrencyDollarIcon className="w-3 h-3" />
                                {event.totalAmount} BAM
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                        >
                          Detalji
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </CardContent>
          </Card>
        ) : (
          /* Calendar View */
          <Card>
            <CardContent className="p-6">
              <div style={{ height: '600px' }}>
                <Calendar
                  localizer={localizer}
                  events={bookings}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  date={date}
                  onNavigate={handleNavigate}
                  onView={handleViewChange}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  components={components}
                  messages={{
                    month: 'Mjesec',
                    week: 'Sedmica',
                    day: 'Dan',
                    agenda: 'Lista',
                    today: 'Danas',
                    previous: 'Prethodna',
                    next: 'Sljedeća',
                    showMore: (total) => `+ ${total} više`,
                  }}
                  formats={{
                    monthHeaderFormat: 'MMMM YYYY',
                    dayHeaderFormat: 'dddd, DD MMMM',
                    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                      `${localizer?.format(start, 'DD MMMM', culture)} - ${localizer?.format(end, 'DD MMMM YYYY', culture)}`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Detalji rezervacije
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedEvent.customerName}</span>
                  </div>
                  
                  {selectedEvent.customerPassportNumber && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-muted-foreground">�</span>
                      <span className="text-sm">{selectedEvent.customerPassportNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {moment(selectedEvent.start).format('DD.MM.YYYY')} - {moment(selectedEvent.end).format('DD.MM.YYYY')}
                    </span>
                  </div>
                  
                  {selectedEvent.totalAmount && (
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedEvent.totalAmount} BAM</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {selectedEvent.status === 'confirmed' ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ExclamationCircleIcon className="w-4 h-4 text-yellow-500" />
                    )}
                    <Badge 
                      variant={
                        selectedEvent.status === 'confirmed' ? 'default' : 
                        selectedEvent.status === 'active' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {selectedEvent.status === 'confirmed' ? 'Potvrđeno' : 
                       selectedEvent.status === 'active' ? 'Aktivno' : 'Završeno'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">ID ugovora:</span>
                    <span className="text-sm font-mono">{selectedEvent.contractId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarAvailabilityPage;