"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid"
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

  useEffect(() => {
    const fetchAvailability = async () => {
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
    }

    fetchAvailability()
  }, [car.license_plate])

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="calendar-toolbar">
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

  // Custom tooltip for events
  const EventTooltip = ({ event }) => (
    <div className="event-tooltip">
      <h4>Booking Details</h4>
      <div className="tooltip-detail">
        <span className="tooltip-label">Customer:</span>
        <span className="tooltip-value">{event.customerName}</span>
      </div>
      {event.customerPhone && (
        <div className="tooltip-detail">
          <span className="tooltip-label">Phone:</span>
          <span className="tooltip-value">{event.customerPhone}</span>
        </div>
      )}
      <div className="tooltip-detail">
        <span className="tooltip-label">Contract ID:</span>
        <span className="tooltip-value">{event.contractId}</span>
      </div>
      {event.totalAmount && (
        <div className="tooltip-detail">
          <span className="tooltip-label">Amount:</span>
          <span className="tooltip-value">${event.totalAmount}</span>
        </div>
      )}
      <div className="tooltip-detail">
        <span className="tooltip-label">Status:</span>
        <span className="tooltip-value">{event.status}</span>
      </div>
      <div className="tooltip-detail">
        <span className="tooltip-label">Period:</span>
        <span className="tooltip-value">
          {moment(event.start).format("MMM D, YYYY")} - {moment(event.end).format("MMM D, YYYY")}
        </span>
      </div>
    </div>
  )

  return (
    <div className="car-availability-calendar">
      <div className="calendar-header">
        <h2 className="calendar-title">
          Availability Calendar: {car.manufacturer} {car.model} ({car.license_plate})
        </h2>
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
          <button
            className="retry-button"
            onClick={() => {
              setIsLoading(true)
              getCarAvailability(car.license_plate)
                .then((availability) => {
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
                })
                .catch((error) => {
                  console.error("Error retrying availability fetch:", error)
                  setError("Failed to load availability data. Please try again later.")
                  toast.error("Failed to load availability data")
                })
                .finally(() => setIsLoading(false))
            }}
          >
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
            onSelectEvent={(event) => {
              // Create a tooltip element
              const tooltipContainer = document.createElement("div")
              tooltipContainer.className = "event-tooltip-container"
              document.body.appendChild(tooltipContainer)

              // Position the tooltip near the event
              const eventElement = document.getElementById(`event-${event.id}`)
              if (eventElement) {
                const rect = eventElement.getBoundingClientRect()
                tooltipContainer.style.top = `${rect.top + window.scrollY}px`
                tooltipContainer.style.left = `${rect.right + window.scrollX + 10}px`
              }

              // Render the tooltip content
              tooltipContainer.innerHTML = `
                <div class="event-tooltip">
                  <h4>Booking Details</h4>
                  <div class="tooltip-detail">
                    <span class="tooltip-label">Customer:</span>
                    <span class="tooltip-value">${event.customerName}</span>
                  </div>
                  ${
                    event.customerPhone
                      ? `
                    <div class="tooltip-detail">
                      <span class="tooltip-label">Phone:</span>
                      <span class="tooltip-value">${event.customerPhone}</span>
                    </div>
                  `
                      : ""
                  }
                  <div class="tooltip-detail">
                    <span class="tooltip-label">Contract ID:</span>
                    <span class="tooltip-value">${event.contractId}</span>
                  </div>
                  ${
                    event.totalAmount
                      ? `
                    <div class="tooltip-detail">
                      <span class="tooltip-label">Amount:</span>
                      <span class="tooltip-value">$${event.totalAmount}</span>
                    </div>
                  `
                      : ""
                  }
                  <div class="tooltip-detail">
                    <span class="tooltip-label">Status:</span>
                    <span class="tooltip-value">${event.status}</span>
                  </div>
                  <div class="tooltip-detail">
                    <span class="tooltip-label">Period:</span>
                    <span class="tooltip-value">
                      ${moment(event.start).format("MMM D, YYYY")} - ${moment(event.end).format("MMM D, YYYY")}
                    </span>
                  </div>
                </div>
              `

              // Remove the tooltip after a delay
              setTimeout(() => {
                document.body.removeChild(tooltipContainer)
              }, 3000)
            }}
            eventPropGetter={(event) => {
              return {
                className: "calendar-event",
                style: {
                  backgroundColor: "#ef4444",
                  borderColor: "#dc2626",
                },
                id: `event-${event.id}`,
              }
            }}
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
    </div>
  )
}

export default CarAvailabilityCalendar
