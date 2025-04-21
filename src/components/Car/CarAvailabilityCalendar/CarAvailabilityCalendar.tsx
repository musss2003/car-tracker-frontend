"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
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
} from "@heroicons/react/solid"
import { getCarAvailability } from "../../../services/carService"
import { toast } from "react-toastify"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "./CarAvailabilityCalendar.css"

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

const CarAvailabilityCalendar = ({ car, onClose }) => {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState("month")
  const [date, setDate] = useState(new Date())
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const tooltipRef = useRef(null)

  const fetchAvailabilityData = useCallback(async () => {
    try {
      setIsLoading(true)
      const availability = await getCarAvailability(car.license_plate)

      // Transform the availability data into events for the calendar
      const events = availability.map((booking) => ({
        id: booking.contractId,
        title: `Booked: ${booking.customerName}`,
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
        contractId: booking.contractId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        totalAmount: booking.totalAmount,
        status: booking.status,
      }))

      setBookings(events)
      setError(null)
    } catch (error) {
      console.error("Error fetching car availability:", error)
      setError("Failed to load availability data. Please try again later.")
      toast.error("Failed to load availability data")
    } finally {
      setIsLoading(false)
    }
  }, [car.license_plate])

  useEffect(() => {
    fetchAvailabilityData()
  }, [fetchAvailabilityData])

  // Handle click outside tooltip to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setSelectedEvent(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="calendar-toolbar">
      <div className="calendar-toolbar-left">
        <div className="calendar-toolbar-nav">
          <button onClick={() => onNavigate("PREV")} className="calendar-nav-button" aria-label="Previous">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button onClick={() => onNavigate("TODAY")} className="calendar-today-button">
            Today
          </button>
          <button onClick={() => onNavigate("NEXT")} className="calendar-nav-button" aria-label="Next">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <h2 className="calendar-toolbar-label">{label}</h2>
      </div>

      <div className="calendar-toolbar-views">
        <button onClick={() => onView("month")} className={`calendar-view-button ${view === "month" ? "active" : ""}`}>
          Month
        </button>
        <button onClick={() => onView("week")} className={`calendar-view-button ${view === "week" ? "active" : ""}`}>
          Week
        </button>
        <button onClick={() => onView("day")} className={`calendar-view-button ${view === "day" ? "active" : ""}`}>
          Day
        </button>
        <button
          onClick={() => onView("agenda")}
          className={`calendar-view-button ${view === "agenda" ? "active" : ""}`}
        >
          Agenda
        </button>
      </div>
    </div>
  )

  // Custom event component to display booking details
  const EventComponent = ({ event }) => (
    <div className="calendar-event">
      <div className="event-title">{event.title}</div>
    </div>
  )

  // Handle event selection
  const handleSelectEvent = (event, e) => {
    // Calculate position for tooltip
    const rect = e.currentTarget.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft

    setTooltipPosition({
      top: rect.top + scrollTop,
      left: rect.right + scrollLeft + 10,
    })

    setSelectedEvent(event)
  }

  return (
    <div className="car-availability-calendar">
      <div className="calendar-header">
        <div className="calendar-header-content">
          <CalendarIcon className="calendar-header-icon" />
          <div className="calendar-header-text">
            <h2 className="calendar-title">Availability Calendar</h2>
            <p className="calendar-subtitle">
              {car.manufacturer} {car.model} ({car.license_plate})
            </p>
          </div>
        </div>
        <button className="calendar-close-button" onClick={onClose} aria-label="Close">
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="calendar-loading">
          <div className="spinner"></div>
          <span>Loading availability data...</span>
        </div>
      ) : error ? (
        <div className="calendar-error">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchAvailabilityData}>
            Retry
          </button>
        </div>
      ) : (
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={bookings}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day", "agenda"]}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            components={{
              toolbar: (props) => <CustomToolbar {...props} view={view} />,
              event: EventComponent,
            }}
            tooltipAccessor={null}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              className: "calendar-event",
              style: {
                backgroundColor: "#ef4444",
                borderColor: "#dc2626",
              },
            })}
            dayPropGetter={(date) => {
              // Check if the day has any bookings
              const hasBooking = bookings.some((booking) =>
                moment(date).isBetween(
                  moment(booking.start).startOf("day"),
                  moment(booking.end).endOf("day"),
                  null,
                  "[]",
                ),
              )

              return {
                className: hasBooking ? "booked-day" : "available-day",
                style: hasBooking ? { backgroundColor: "#fee2e2" } : { backgroundColor: "#d1fae5" },
              }
            }}
          />
        </div>
      )}

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
          <div className="legend-color event"></div>
          <span>Booking</span>
        </div>
      </div>

      {selectedEvent && (
        <div
          ref={tooltipRef}
          className="event-tooltip-container"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="event-tooltip">
            <div className="event-tooltip-header">
              <h4>Booking Details</h4>
              <button
                className="tooltip-close-button"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close tooltip"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="tooltip-detail">
              <UserIcon className="tooltip-icon" />
              <span className="tooltip-label">Customer:</span>
              <span className="tooltip-value">{selectedEvent.customerName}</span>
            </div>

            {selectedEvent.customerPhone && (
              <div className="tooltip-detail">
                <PhoneIcon className="tooltip-icon" />
                <span className="tooltip-label">Phone:</span>
                <span className="tooltip-value">{selectedEvent.customerPhone}</span>
              </div>
            )}

            <div className="tooltip-detail">
              <DocumentTextIcon className="tooltip-icon" />
              <span className="tooltip-label">Contract ID:</span>
              <span className="tooltip-value">{selectedEvent.contractId}</span>
            </div>

            {selectedEvent.totalAmount && (
              <div className="tooltip-detail">
                <CurrencyDollarIcon className="tooltip-icon" />
                <span className="tooltip-label">Amount:</span>
                <span className="tooltip-value">${selectedEvent.totalAmount}</span>
              </div>
            )}

            <div className="tooltip-detail">
              <StatusOnlineIcon className="tooltip-icon" />
              <span className="tooltip-label">Status:</span>
              <span className="tooltip-value status-badge">{selectedEvent.status}</span>
            </div>

            <div className="tooltip-detail">
              <ClockIcon className="tooltip-icon" />
              <span className="tooltip-label">Period:</span>
              <span className="tooltip-value">
                {moment(selectedEvent.start).format("MMM D, YYYY")} - {moment(selectedEvent.end).format("MMM D, YYYY")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarAvailabilityCalendar
