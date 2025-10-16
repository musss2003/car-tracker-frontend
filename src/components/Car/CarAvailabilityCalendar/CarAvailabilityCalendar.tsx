'use client';

import type React from 'react';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Calendar,
  type View,
  momentLocalizer,
  type ToolbarProps,
  type DateLocalizer,
  type Components,
} from 'react-big-calendar';
import moment from 'moment';
import {
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  StatusOnlineIcon,
  ClockIcon,
  RefreshIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ViewListIcon,
  ViewGridIcon,
} from '@heroicons/react/solid';
import { getCarAvailability } from '../../../services/carService';
import { toast } from 'react-toastify';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CarAvailabilityCalendar.css';
import type { BookingEvent, Car } from '../../../types/Car';

interface CarAvailabilityCalendarProps {
  car: Car;
  onClose: () => void;
}

// Setup the localizer for react-big-calendar
const localizer: DateLocalizer = momentLocalizer(moment);

/**
 * CarAvailabilityCalendar Component
 *
 * Displays a calendar view of a car's availability and bookings.
 * Allows users to view bookings in different calendar views (month, week, day, agenda).
 * Shows detailed booking information in tooltips.
 */

const CarAvailabilityCalendar: React.FC<CarAvailabilityCalendarProps> = ({
  car,
  onClose,
}) => {
  // State management
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState<Date>(new Date());
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMobileViewOpen, setIsMobileViewOpen] = useState<boolean>(false);
  const [isCompactView, setIsCompactView] = useState<boolean>(
    window.innerWidth < 768
  );
  const [showListView, setShowListView] = useState<boolean>(false);

  // Refs
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const mobileViewRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Fetches car availability data from the API
   */
  const fetchAvailabilityData = useCallback(
    async (showRefreshing = true) => {
      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const availability = await getCarAvailability(car.licensePlate);

        // Transform the availability data into events for the calendar
        const events: BookingEvent[] = availability.map(
          (booking): BookingEvent => ({
            title: `Booked: ${booking.customerName}`,
            start: new Date(booking.start),
            end: new Date(booking.end),
            contractId: booking.contractId,
            customerName: booking.customerName,
            customerPassportNumber: booking.customerPassportNumber,
            totalAmount: booking.totalAmount,
            status: (() => {
              const now = new Date();
              if (new Date(booking.start).getTime() > now.getTime()) {
                return 'confirmed';
              } else if (
                new Date(booking.start).getTime() <= now.getTime() &&
                new Date(booking.end).getTime() >= now.getTime()
              ) {
                return 'active';
              } else {
                return 'completed';
              }
            })(),
          })
        );

        setBookings(events);
        setError(null);

        if (showRefreshing) {
          toast.success('Calendar data refreshed successfully');
        }
      } catch (error) {
        console.error('Error fetching car availability:', error);
        setError('Failed to load availability data. Please try again later.');
        toast.error('Failed to load availability data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [car.licensePlate]
  );

  // Initial data fetch
  useEffect(() => {
    fetchAvailabilityData(false);
  }, [fetchAvailabilityData]);

  // Handle window resize for responsive view
  useEffect(() => {
    const handleResize = () => {
      setIsCompactView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle click outside tooltip to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setSelectedEvent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle click outside mobile view to close it
  useEffect(() => {
    const handleResize = () => {
      setIsCompactView(window.innerWidth < 768);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileViewOpen &&
        mobileViewRef.current &&
        !mobileViewRef.current.contains(event.target as Node)
      ) {
        setIsMobileViewOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleResize);
    };
  }, [isMobileViewOpen]);

  // Handle click outside calendar to close the entire component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key to close tooltip and mobile view
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedEvent(null);
        setIsMobileViewOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Prevent body scrolling when mobile view is open
  useEffect(() => {
    if (isMobileViewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileViewOpen]);

  /**
   * Custom toolbar component for the calendar
   */
  const CustomToolbar: React.FC<
    ToolbarProps<BookingEvent> & { view: View }
  > = ({ label, onNavigate, onView, view }) => {
    return (
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <div className="calendar-toolbar-nav">
            <button
              onClick={() => onNavigate('PREV')}
              className="calendar-nav-button"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="calendar-icon" />
            </button>
            <button
              onClick={() => onNavigate('TODAY')}
              className="calendar-today-button"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="calendar-nav-button"
              aria-label="Next"
            >
              <ChevronRightIcon className="calendar-icon" />
            </button>
          </div>
          <h2 className="calendar-toolbar-label">{label}</h2>
        </div>

        <div className="calendar-toolbar-right">
          <button
            onClick={() => fetchAvailabilityData(true)}
            className="calendar-refresh-button"
            disabled={isRefreshing}
            aria-label="Refresh calendar data"
          >
            <RefreshIcon
              className={`calendar-icon ${isRefreshing ? 'spinning' : ''}`}
            />
            <span className="refresh-text">Refresh</span>
          </button>

          {/* Toggle between calendar and list view (for both mobile and desktop) */}
          <button
            onClick={() => setShowListView(!showListView)}
            className="calendar-view-toggle-button"
            aria-label={showListView ? 'Show calendar view' : 'Show list view'}
          >
            {showListView ? (
              <>
                <ViewGridIcon className="calendar-icon" />
                <span className="view-toggle-text">Calendar</span>
              </>
            ) : (
              <>
                <ViewListIcon className="calendar-icon" />
                <span className="view-toggle-text">List</span>
              </>
            )}
          </button>

          {!showListView && (
            <div className="calendar-toolbar-views">
              <button
                onClick={() => onView('month')}
                className={`calendar-view-button ${view === 'month' ? 'active' : ''}`}
              >
                Month
              </button>
              <button
                onClick={() => onView('week')}
                className={`calendar-view-button ${view === 'week' ? 'active' : ''}`}
              >
                Week
              </button>
              <button
                onClick={() => onView('day')}
                className={`calendar-view-button ${view === 'day' ? 'active' : ''}`}
              >
                Day
              </button>
              <button
                onClick={() => onView('agenda')}
                className={`calendar-view-button ${view === 'agenda' ? 'active' : ''}`}
              >
                Agenda
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Custom event component to display booking details
   */
  const EventComponent: React.FC<{ event: BookingEvent }> = ({ event }) => {
    // Determine status icon
    let StatusIcon = CheckCircleIcon;
    let statusClass = 'status-active';

    if (event.status === 'confirmed') {
      StatusIcon = InformationCircleIcon;
      statusClass = 'status-confirmed';
    } else if (event.status === 'completed') {
      StatusIcon = CheckCircleIcon;
      statusClass = 'status-completed';
    }

    return (
      <div className={`calendar-event ${statusClass}`}>
        <StatusIcon className="event-status-icon" />
        <div className="event-title">{event.title}</div>
      </div>
    );
  };

  /**
   * Handle event selection and show tooltip
   */
  const handleSelectEvent = (
    event: BookingEvent,
    e: React.SyntheticEvent<HTMLElement>
  ) => {
    // On mobile, open the mobile view instead of tooltip
    if (isCompactView) {
      setSelectedEvent(event);
      setIsMobileViewOpen(true);
      return;
    }

    // Calculate position for tooltip
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Get calendar container dimensions
    const calendarRect = calendarRef.current?.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // Calculate tooltip position
    let left = rect.right + scrollLeft + 10;

    // Check if tooltip would go off-screen to the right
    if (calendarRect && left + 320 > windowWidth) {
      left = rect.left + scrollLeft - 330; // Position to the left of the event
    }

    setTooltipPosition({
      top: rect.top + scrollTop,
      left: left,
    });

    setSelectedEvent(event);
  };

  // Memoize calendar components to prevent unnecessary re-renders
  const calendarComponents = useMemo<Components<BookingEvent>>(
    () => ({
      toolbar: (props) => <CustomToolbar {...props} view={view} />,
      event: EventComponent,
    }),
    [view, isCompactView, showListView]
  );

  // Render booking details for mobile view
  const renderBookingDetails = (event: BookingEvent) => {
    return (
      <div className="booking-details">
        <div className="booking-details-header">
          <div className={`booking-status ${event.status}`}>{event.status}</div>
          <div className="booking-dates">
            {moment(event.start).format('MMM D')} -{' '}
            {moment(event.end).format('MMM D, YYYY')}
          </div>
        </div>

        <div className="booking-details-content">
          <div className="booking-detail-item">
            <UserIcon className="booking-detail-icon" />
            <div className="booking-detail-text">
              <span className="booking-detail-label">Customer</span>
              <span className="booking-detail-value">{event.customerName}</span>
            </div>
          </div>

          {event.customerPassportNumber && (
            <div className="booking-detail-item">
              <DocumentTextIcon className="booking-detail-icon" />
              <div className="booking-detail-text">
                <span className="booking-detail-label">Passport</span>
                <span className="booking-detail-value">
                  {event.customerPassportNumber}
                </span>
              </div>
            </div>
          )}

          <div className="booking-detail-item">
            <DocumentTextIcon className="booking-detail-icon" />
            <div className="booking-detail-text">
              <span className="booking-detail-label">Contract</span>
              <span className="booking-detail-value">{event.contractId}</span>
            </div>
          </div>

          {event.totalAmount && (
            <div className="booking-detail-item">
              <CurrencyDollarIcon className="booking-detail-icon" />
              <div className="booking-detail-text">
                <span className="booking-detail-label">Amount</span>
                <span className="booking-detail-value">
                  ${event.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="booking-detail-item">
            <ClockIcon className="booking-detail-icon" />
            <div className="booking-detail-text">
              <span className="booking-detail-label">Duration</span>
              <span className="booking-detail-value">
                {moment(event.end).diff(moment(event.start), 'days')} days
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render bookings list (for both mobile and desktop)
  const renderBookingsList = () => {
    // Sort bookings by start date (newest first)
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
    );

    return (
      <div className="bookings-list">
        <div className="bookings-list-header">
          <h3>Bookings</h3>
          <span className="bookings-count">{bookings.length} total</span>
        </div>

        {sortedBookings.length === 0 ? (
          <div className="bookings-empty">
            <p>No bookings found for this vehicle.</p>
          </div>
        ) : (
          <div className="bookings-table">
            <div className="bookings-table-header">
              <div className="booking-header-cell booking-dates-cell">
                Dates
              </div>
              <div className="booking-header-cell booking-customer-cell">
                Customer
              </div>
              <div className="booking-header-cell booking-contract-cell">
                Contract
              </div>
              <div className="booking-header-cell booking-status-cell">
                Status
              </div>
            </div>
            <div className="bookings-table-body">
              {sortedBookings.length === 0 ? (
                <div className="bookings-empty-state">
                  <CalendarIcon className="empty-state-icon" />
                  <p className="empty-state-message">
                    No bookings found for this vehicle
                  </p>
                  <p className="empty-state-suggestion">
                    This vehicle is available for booking
                  </p>
                </div>
              ) : (
                sortedBookings.map((booking, index) => (
                  <div
                    key={`${booking.contractId}-${index}`}
                    className={`booking-row ${booking.status}`}
                  >
                    <div className="booking-cell booking-dates-cell">
                      <div className="booking-date-range">
                        <div className="booking-date-label">From - To</div>
                        <div className="booking-dates-container">
                          <div className="booking-start-date">
                            <CalendarIcon className="booking-date-icon" />
                            {moment(booking.start).format('MMM D, YYYY')}
                          </div>
                          <div className="booking-date-separator">→</div>
                          <div className="booking-end-date">
                            <CalendarIcon className="booking-date-icon" />
                            {moment(booking.end).format('MMM D, YYYY')}
                          </div>
                        </div>
                        <div className="booking-duration">
                          <ClockIcon className="booking-duration-icon" />
                          <span>
                            {moment(booking.end).diff(
                              moment(booking.start),
                              'days'
                            )}{' '}
                            days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-cell booking-customer-cell">
                      <div className="booking-customer-info">
                        <div className="booking-customer-label">Customer</div>
                        <div className="booking-customer-name">
                          <UserIcon className="booking-customer-icon" />
                          {booking.customerName}
                        </div>
                        {booking.customerPassportNumber && (
                          <div className="booking-customer-passport">
                            <DocumentTextIcon className="booking-passport-icon" />
                            Passport: {booking.customerPassportNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="booking-cell booking-details-cell">
                      <div className="booking-details-info">
                        <div className="booking-details-label">Details</div>
                        <div className="booking-contract-id">
                          <DocumentTextIcon className="booking-contract-icon" />
                          Contract: {booking.contractId}
                        </div>
                        {booking.totalAmount && (
                          <div className="booking-amount">
                            <CurrencyDollarIcon className="booking-amount-icon" />
                            ${booking.totalAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="booking-cell booking-status-cell">
                      <div className="booking-status-info">
                        <div className="booking-status-label">Status</div>
                        <div
                          className={`booking-status-badge ${booking.status}`}
                        >
                          {booking.status === 'confirmed' && (
                            <InformationCircleIcon className="booking-status-icon" />
                          )}
                          {booking.status === 'active' && (
                            <StatusOnlineIcon className="booking-status-icon" />
                          )}
                          {booking.status === 'completed' && (
                            <CheckCircleIcon className="booking-status-icon" />
                          )}
                          <span className="booking-status-text">
                            {booking.status}
                          </span>
                        </div>
                        <div className="booking-status-date">
                          {booking.status === 'confirmed' && (
                            <span>
                              Starts {moment(booking.start).fromNow()}
                            </span>
                          )}
                          {booking.status === 'active' && (
                            <span>Ends {moment(booking.end).fromNow()}</span>
                          )}
                          {booking.status === 'completed' && (
                            <span>Ended {moment(booking.end).fromNow()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="car-availability-calendar-wrapper">
      <div className="car-availability-calendar" ref={containerRef}>
        {/* Close button moved to top-right corner */}
        <button
          className="calendar-close-button-corner"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon className="calendar-icon" />
        </button>

        <div className="calendar-header">
          <div className="calendar-header-content">
            <CalendarIcon className="calendar-header-icon" />
            <div className="calendar-header-text">
              <h2 className="calendar-title">Availability Calendar</h2>
              <p className="calendar-subtitle">
                {car.manufacturer} {car.model} ({car.licensePlate})
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="calendar-loading">
            <div className="spinner"></div>
            <span>Loading availability data...</span>
          </div>
        ) : error ? (
          <div className="calendar-error">
            <ExclamationCircleIcon className="error-icon" />
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => fetchAvailabilityData(false)}
            >
              Retry
            </button>
          </div>
        ) : showListView ? (
          // List view for both desktop and mobile
          <div
            className="calendar-container list-view-container"
            ref={calendarRef}
          >
            {renderBookingsList()}
          </div>
        ) : (
          // Calendar view
          <div className="calendar-container" ref={calendarRef}>
            <Calendar
              localizer={localizer}
              events={bookings}
              startAccessor="start"
              endAccessor="end"
              views={['month', 'week', 'day', 'agenda']}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              components={calendarComponents}
              tooltipAccessor={null}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={(event) => {
                let className = 'calendar-event';
                let style = {};

                if (event.status === 'confirmed') {
                  style = {
                    backgroundColor: '#4f46e5', // Indigo
                    borderColor: '#4338ca',
                  };
                  className += ' status-confirmed';
                } else if (event.status === 'completed') {
                  style = {
                    backgroundColor: '#059669', // Green
                    borderColor: '#047857',
                  };
                  className += ' status-completed';
                } else {
                  // Active
                  style = {
                    backgroundColor: '#e11d48', // Rose/Red
                    borderColor: '#be123c',
                  };
                  className += ' status-active';
                }

                return { className, style };
              }}
              dayPropGetter={(date) => {
                // Check if the day has any bookings
                const hasBooking = bookings.some((booking) =>
                  moment(date).isBetween(
                    moment(booking.start).startOf('day'),
                    moment(booking.end).endOf('day'),
                    null,
                    '[]'
                  )
                );

                // Check if the day is in the past
                const isPast = moment(date).isBefore(moment().startOf('day'));

                let className = hasBooking ? 'booked-day' : 'available-day';
                let style = {};

                if (isPast) {
                  className += ' past-day';
                  style = {
                    backgroundColor: '#f3f4f6',
                    color: '#9ca3af',
                  };
                } else if (hasBooking) {
                  style = { backgroundColor: '#fee2e2' };
                } else {
                  style = { backgroundColor: '#d1fae5' };
                }

                return { className, style };
              }}
              popup
              selectable={false}
            />
          </div>
        )}

        {!showListView && (
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color booked"></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="legend-color past"></div>
              <span>Past</span>
            </div>
            <div className="legend-item">
              <div className="legend-color event active"></div>
              <span>Active</span>
            </div>
            <div className="legend-item">
              <div className="legend-color event confirmed"></div>
              <span>Confirmed</span>
            </div>
            <div className="legend-item">
              <div className="legend-color event completed"></div>
              <span>Completed</span>
            </div>
          </div>
        )}

        {/* Desktop Tooltip */}
        {selectedEvent && !isCompactView && (
          <div
            ref={tooltipRef}
            className="event-tooltip-container"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
            role="dialog"
            aria-labelledby="tooltip-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="event-tooltip">
              <div className="event-tooltip-header">
                <h4 id="tooltip-title">Booking Details</h4>
                <button
                  className="tooltip-close-button"
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close tooltip"
                >
                  <XIcon className="tooltip-icon-small" />
                </button>
              </div>

              <div className="tooltip-content">
                <div className="tooltip-detail">
                  <UserIcon className="tooltip-icon" />
                  <span className="tooltip-label">Customer:</span>
                  <span className="tooltip-value">
                    {selectedEvent.customerName}
                  </span>
                </div>

                {selectedEvent.customerPassportNumber && (
                  <div className="tooltip-detail">
                    <PhoneIcon className="tooltip-icon" />
                    <span className="tooltip-label">Passport:</span>
                    <span className="tooltip-value">
                      {selectedEvent.customerPassportNumber}
                    </span>
                  </div>
                )}

                <div className="tooltip-detail">
                  <DocumentTextIcon className="tooltip-icon" />
                  <span className="tooltip-label">Contract ID:</span>
                  <span className="tooltip-value">
                    {selectedEvent.contractId}
                  </span>
                </div>

                {selectedEvent.totalAmount && (
                  <div className="tooltip-detail">
                    <CurrencyDollarIcon className="tooltip-icon" />
                    <span className="tooltip-label">Amount:</span>
                    <span className="tooltip-value">
                      ${selectedEvent.totalAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="tooltip-detail">
                  <StatusOnlineIcon className="tooltip-icon" />
                  <span className="tooltip-label">Status:</span>
                  <span
                    className={`tooltip-value status-badge ${selectedEvent.status.toLowerCase()}`}
                  >
                    {selectedEvent.status}
                  </span>
                </div>

                <div className="tooltip-detail">
                  <ClockIcon className="tooltip-icon" />
                  <span className="tooltip-label">Period:</span>
                  <span className="tooltip-value">
                    {moment(selectedEvent.start).format('MMM D, YYYY')} -{' '}
                    {moment(selectedEvent.end).format('MMM D, YYYY')}
                  </span>
                </div>

                <div className="tooltip-detail">
                  <ClockIcon className="tooltip-icon" />
                  <span className="tooltip-label">Duration:</span>
                  <span className="tooltip-value">
                    {moment(selectedEvent.end).diff(
                      moment(selectedEvent.start),
                      'days'
                    )}{' '}
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile View */}
        {isMobileViewOpen && (
          <div
            className="mobile-view-overlay"
            onClick={() => setIsMobileViewOpen(false)}
          >
            <div
              className="mobile-view-container"
              ref={mobileViewRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-view-header">
                <button
                  className="mobile-view-close"
                  onClick={() => setIsMobileViewOpen(false)}
                  aria-label="Close mobile view"
                >
                  <XIcon className="mobile-view-close-icon" />
                </button>
                <h3 className="mobile-view-title">
                  {selectedEvent ? 'Booking Details' : 'All Bookings'}
                </h3>
                {selectedEvent && (
                  <button
                    className="mobile-view-back"
                    onClick={() => setSelectedEvent(null)}
                    aria-label="Back to bookings list"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="mobile-view-content">
                {selectedEvent
                  ? renderBookingDetails(selectedEvent)
                  : renderBookingsList()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarAvailabilityCalendar;
