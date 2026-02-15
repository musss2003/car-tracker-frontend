import { useState, useEffect, useCallback } from 'react';
import { logError } from '@/shared/utils/logger';
import {
  CalendarIcon,
  RefreshCw,
  User,
  Clock,
  List,
  Grid3x3,
} from 'lucide-react';
import {
  Calendar,
  type View,
  momentLocalizer,
  type Components,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BookingEvent, Car } from '../types/car.types';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { PageHeader } from '@/shared/components/ui/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { DetailField } from '@/shared/components/ui/detail-field';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { getCar, getCarAvailability } from '../services/carService';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

export default function CarAvailabilityPage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id as string;

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
  const fetchCarAndBookings = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // Get car data
        const foundCar = await getCar(id);

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
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ); // Normalize to start of day

        const events: BookingEvent[] = availability.map(
          (booking): BookingEvent => {
            const startDate = new Date(booking.start);
            const endDate = new Date(booking.end);

            let status: 'confirmed' | 'active' | 'completed';
            if (startDate.getTime() > now.getTime()) {
              status = 'confirmed';
            } else if (endDate.getTime() >= today.getTime()) {
              status = 'active';
            } else {
              status = 'completed';
            }

            return {
              title: `Rezervacija: ${booking.customerName}`,
              start: startDate,
              end: endDate,
              contractId: booking.contractId,
              customerName: booking.customerName,
              customerPassportNumber: booking.customerPassportNumber,
              totalAmount: booking.totalAmount,
              status,
              resource: booking,
            };
          }
        );
        setBookings(events);
        setError(null);
      } catch (error) {
        logError('Error fetching car availability:', error);
        setError('Neuspješno učitavanje kalendara');
        toast.error('Neuspješno učitavanje kalendara');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, navigate, toast]
  );

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

  // Custom toolbar component for the calendar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate('PREV')}>
          ←
        </Button>
        <h3 className="text-lg font-semibold min-w-[200px] text-center">
          {label}
        </h3>
        <Button variant="outline" size="sm" onClick={() => onNavigate('NEXT')}>
          →
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')}>
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
          {showAgenda ? (
            <Grid3x3 className="w-4 h-4" />
          ) : (
            <List className="w-4 h-4" />
          )}
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
      backgroundColor = '#f59e0b'; // Orange for active
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
        display: 'block',
      },
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

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    if (status === 'confirmed') return 'default';
    if (status === 'active') return 'secondary';
    return 'outline';
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    if (status === 'confirmed') return 'Potvrđeno';
    if (status === 'active') return 'Aktivno';
    return 'Završeno';
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <LoadingState text="Učitavanje kalendara..." />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="h-full flex flex-col bg-background">
        <PageHeader title="Greška" onBack={() => navigate('/cars')} />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                {error || 'Vozilo nije pronađeno'}
              </p>
              <Button onClick={() => navigate('/cars')} className="w-full">
                Nazad na vozila
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <PageHeader
        title={`${car.manufacturer} ${car.model}`}
        subtitle={`Kalendar dostupnosti - ${car.licensePlate}`}
        onBack={() => navigate(`/cars/${id}`)}
        actions={
          <Button
            onClick={() => fetchCarAndBookings(true)}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Osvježi
          </Button>
        }
      />

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-4 lg:p-6 mx-auto space-y-6">
          {/* Car Info Summary Card */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DetailField
                  label="Registarska oznaka"
                  value={car.licensePlate}
                />
                <DetailField label="Godina" value={car.year} />
                <DetailField
                  label="Cijena po danu"
                  value={car.pricePerDay ? `${car.pricePerDay} BAM` : 'N/A'}
                />
                <DetailField
                  label="Ukupno rezervacija"
                  value={
                    <span className="text-2xl font-bold text-primary">
                      {bookings.length}
                    </span>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Legend Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Legenda:
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-sm">Potvrđeno</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500" />
                  <span className="text-sm">Aktivno</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-500" />
                  <span className="text-sm">Završeno</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {showAgenda ? (
            /* Agenda View - List of Bookings */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Lista rezervacija
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nema rezervacija za prikazivanje</p>
                  </div>
                ) : (
                  bookings
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map((event, index) => {
                      const statusColorMap = {
                        confirmed:
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                        active:
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
                        completed:
                          'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
                      };
                      const statusColor =
                        statusColorMap[event.status] ||
                        statusColorMap.completed;

                      return (
                        <div
                          key={index}
                          className="flex gap-4 p-5 rounded-xl border-2 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColor}`}
                            >
                              <User className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg mb-1">
                                  {event.customerName}
                                </h4>
                                {event.customerPassportNumber && (
                                  <p className="text-sm text-muted-foreground">
                                    Pasoš: {event.customerPassportNumber}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 items-center flex-shrink-0">
                                <Badge
                                  variant={getStatusBadgeVariant(event.status)}
                                >
                                  {getStatusLabel(event.status)}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  Detalji
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center flex-wrap gap-3 mt-3 text-sm border-t pt-3">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                  {moment(event.start).format('DD.MM.YYYY')} -{' '}
                                  {moment(event.end).format('DD.MM.YYYY')}
                                </span>
                              </span>
                              {event.totalAmount && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                                  {event.totalAmount.toFixed(2)} BAM
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </CardContent>
            </Card>
          ) : (
            /* Calendar View */
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="h-[600px] lg:h-[700px]">
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
                      dayRangeHeaderFormat: (
                        { start, end },
                        culture,
                        localizer
                      ) =>
                        `${localizer?.format(start, 'DD MMMM', culture)} - ${localizer?.format(end, 'DD MMMM YYYY', culture)}`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Detalji rezervacije
            </DialogTitle>
            <DialogDescription>
              Pregled informacija o rezervaciji
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 pt-4">
              <DetailField label="Kupac" value={selectedEvent.customerName} />
              {selectedEvent.customerPassportNumber && (
                <DetailField
                  label="Broj pasoša"
                  value={selectedEvent.customerPassportNumber}
                />
              )}
              <DetailField
                label="Period"
                value={`${moment(selectedEvent.start).format('DD.MM.YYYY')} - ${moment(selectedEvent.end).format('DD.MM.YYYY')}`}
              />
              {selectedEvent.totalAmount && (
                <DetailField
                  label="Ukupan iznos"
                  value={`${selectedEvent.totalAmount} BAM`}
                />
              )}
              <DetailField
                label="Status"
                value={
                  <Badge variant={getStatusBadgeVariant(selectedEvent.status)}>
                    {getStatusLabel(selectedEvent.status)}
                  </Badge>
                }
              />
              <DetailField
                label="ID ugovora"
                value={String(selectedEvent.contractId)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
