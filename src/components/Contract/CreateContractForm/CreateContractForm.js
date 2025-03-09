"use client"

import { useState } from "react"
import { getAvailableCarsForPeriod } from "../../../services/carService"
import { searchCustomersByName } from "../../../services/customerService"
import {
  XIcon,
  UserIcon,
  CalendarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PhotographIcon,
  SearchIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/solid"
import "./CreateContractForm.css"

const CreateContractForm = ({ onSave, onClose }) => {
  // Form state
  const [formData, setFormData] = useState({
    customer: null,
    car: null,
    rentalPeriod: {
      startDate: "",
      endDate: "",
    },
    rentalPrice: {
      dailyRate: 0,
      totalAmount: 0,
    },
    status: "active",
    paymentDetails: {
      paymentMethod: "cash",
      paymentStatus: "pending",
    },
    additionalNotes: "",
    contractPhoto: "",
  })

  // UI state
  const [availableCars, setAvailableCars] = useState([])
  const [loadingCars, setLoadingCars] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [customerResults, setCustomerResults] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCarSelector, setShowCarSelector] = useState(false)

  // Calculate rental duration in days
  const calculateDuration = (startDate, endDate) => {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const differenceInTime = end.getTime() - start.getTime()
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24))
      return differenceInDays > 0 ? differenceInDays : 0
    } catch (error) {
      return 0
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    const path = name.split(".")

    // Clear error when field is edited
    setErrors((prev) => ({ ...prev, [name]: null }))

    if (path.length === 1) {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [path[0]]: {
          ...prev[path[0]],
          [path[1]]: value,
        },
      }))
    }
  }

  // Handle date changes with validation
  const handleDateChange = (e) => {
    const { name, value } = e.target
    const field = name.split(".")[1]
    const otherField = field === "startDate" ? "endDate" : "startDate"
    const otherValue = formData.rentalPeriod[otherField]

    // Clear error when field is edited
    setErrors((prev) => ({ ...prev, [name]: null }))

    // Validate date selection
    if (field === "endDate" && otherValue && new Date(value) < new Date(otherValue)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "End date cannot be earlier than start date",
      }))
      return
    }

    if (field === "startDate" && otherValue && new Date(otherValue) < new Date(value)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Start date cannot be later than end date",
      }))
      return
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      rentalPeriod: {
        ...prev.rentalPeriod,
        [field]: value,
      },
    }))

    // Check if both dates are set to fetch available cars
    const updatedDates = {
      ...formData.rentalPeriod,
      [field]: value,
    }

    if (updatedDates.startDate && updatedDates.endDate) {
      fetchCarsForPeriod(updatedDates.startDate, updatedDates.endDate)
    }
  }

  // Fetch available cars for the selected period
  const fetchCarsForPeriod = async (startDate, endDate) => {
    setLoadingCars(true)
    try {
      const cars = await getAvailableCarsForPeriod(startDate, endDate)
      setAvailableCars(cars)
      setShowCarSelector(true)
    } catch (error) {
      console.error("Error fetching available cars:", error)
      setErrors((prev) => ({
        ...prev,
        cars: "Failed to load available cars. Please try again.",
      }))
    } finally {
      setLoadingCars(false)
    }
  }

  // Handle car selection
  const handleCarSelect = (carId) => {
    const selectedCar = availableCars.find((car) => car._id === carId)
    if (selectedCar) {
      const duration = calculateDuration(formData.rentalPeriod.startDate, formData.rentalPeriod.endDate)

      const totalAmount = duration * selectedCar.price_per_day

      setFormData((prev) => ({
        ...prev,
        car: selectedCar,
        rentalPrice: {
          dailyRate: selectedCar.price_per_day,
          totalAmount: totalAmount,
        },
      }))
    }
  }

  // Handle customer search
  const handleCustomerSearch = async (e) => {
    const query = e.target.value
    setCustomerSearch(query)

    // Clear error when field is edited
    setErrors((prev) => ({ ...prev, customer: null }))

    if (query.length > 2) {
      setLoadingCustomers(true)
      try {
        const results = await searchCustomersByName(query)
        setCustomerResults(results)
        // Ensure the dropdown is visible by scrolling to it if needed
        setTimeout(() => {
          const resultsElement = document.querySelector(".customer-results")
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
          }
        }, 100)
      } catch (error) {
        console.error("Error fetching customers:", error)
        setErrors((prev) => ({
          ...prev,
          customer: "Failed to search customers. Please try again.",
        }))
      } finally {
        setLoadingCustomers(false)
      }
    } else {
      setCustomerResults([])
    }
  }

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({ ...prev, customer }))
    setCustomerSearch(customer.name)
    setCustomerResults([])
  }

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {}

    // Check required fields
    if (!formData.customer || !formData.customer._id) {
      newErrors.customer = "Customer is required"
    }

    if (!formData.car || !formData.car._id) {
      newErrors.car = "Car selection is required"
    }

    if (!formData.rentalPeriod.startDate) {
      newErrors["rentalPeriod.startDate"] = "Start date is required"
    }

    if (!formData.rentalPeriod.endDate) {
      newErrors["rentalPeriod.endDate"] = "End date is required"
    }

    // Validate dates
    if (formData.rentalPeriod.startDate && formData.rentalPeriod.endDate) {
      const startDate = new Date(formData.rentalPeriod.startDate)
      const endDate = new Date(formData.rentalPeriod.endDate)

      if (endDate < startDate) {
        newErrors["rentalPeriod.endDate"] = "End date cannot be earlier than start date"
      }
    }

    // Validate payment method
    if (!formData.paymentDetails.paymentMethod) {
      newErrors["paymentDetails.paymentMethod"] = "Payment method is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error("Error creating contract:", error)
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to create contract. Please try again.",
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Set minimum date for date inputs (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="create-contract-form-container">
      <div className="form-header">
        <h2 className="form-title">Create New Contract</h2>
        <button type="button" className="close-button" onClick={onClose}>
          <XIcon className="icon" />
        </button>
      </div>

      {errors.submit && (
        <div className="global-error">
          <ExclamationCircleIcon className="error-icon" />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-contract-form">
        <div className="form-grid">
          {/* Customer Section */}
          <div className="form-section customer-section">
            <div className="section-header">
              <UserIcon className="section-icon" />
              <h3 className="section-title">Customer</h3>
            </div>
            <div className="section-content">
              <div className="customer-search-container">
                <div className={`search-input-wrapper ${errors.customer ? "has-error" : ""}`}>
                  <SearchIcon className="search-icon" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={handleCustomerSearch}
                    placeholder="Search customer by name..."
                    className="customer-search-input"
                  />
                </div>

                {errors.customer && (
                  <div className="field-error">
                    <ExclamationCircleIcon className="error-icon-small" />
                    <span>{errors.customer}</span>
                  </div>
                )}

                {loadingCustomers && (
                  <div className="loading-indicator">
                    <div className="spinner-small"></div>
                    <span>Searching...</span>
                  </div>
                )}

                {customerResults.length > 0 && (
                  <ul className="customer-results">
                    {customerResults.map((customer) => (
                      <li
                        key={customer._id}
                        className="customer-result-item"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="customer-avatar">{customer.name.charAt(0)}</div>
                        <div className="customer-info">
                          <span className="customer-name">{customer.name}</span>
                          <span className="customer-passport">{customer.passport_number}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {formData.customer && formData.customer._id && (
                <div className="selected-customer">
                  <div className="customer-card">
                    <div className="customer-avatar large">{formData.customer.name.charAt(0)}</div>
                    <div className="customer-details">
                      <p className="customer-name">{formData.customer.name}</p>
                      <p className="customer-passport">Passport: {formData.customer.passport_number}</p>
                      {formData.customer.phone && <p className="customer-phone">Phone: {formData.customer.phone}</p>}
                      {formData.customer.email && <p className="customer-email">Email: {formData.customer.email}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rental Period Section */}
          <div className="form-section period-section">
            <div className="section-header">
              <CalendarIcon className="section-icon" />
              <h3 className="section-title">Rental Period</h3>
            </div>
            <div className="section-content">
              <div className="date-fields">
                <div className="form-field">
                  <label htmlFor="startDate" className="field-label">
                    Start Date
                  </label>
                  <div className={`field-input-wrapper ${errors["rentalPeriod.startDate"] ? "has-error" : ""}`}>
                    <input
                      type="date"
                      id="startDate"
                      name="rentalPeriod.startDate"
                      value={formData.rentalPeriod.startDate}
                      onChange={handleDateChange}
                      className="date-input"
                      min={today}
                    />
                  </div>
                  {errors["rentalPeriod.startDate"] && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors["rentalPeriod.startDate"]}</span>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="endDate" className="field-label">
                    End Date
                  </label>
                  <div className={`field-input-wrapper ${errors["rentalPeriod.endDate"] ? "has-error" : ""}`}>
                    <input
                      type="date"
                      id="endDate"
                      name="rentalPeriod.endDate"
                      value={formData.rentalPeriod.endDate}
                      onChange={handleDateChange}
                      className="date-input"
                      min={formData.rentalPeriod.startDate || today}
                    />
                  </div>
                  {errors["rentalPeriod.endDate"] && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors["rentalPeriod.endDate"]}</span>
                    </div>
                  )}
                </div>
              </div>

              {formData.rentalPeriod.startDate && formData.rentalPeriod.endDate && (
                <div className="rental-duration">
                  <span className="duration-label">Duration:</span>
                  <span className="duration-value">
                    {calculateDuration(formData.rentalPeriod.startDate, formData.rentalPeriod.endDate)} days
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Car Selection Section */}
          <div className="form-section car-section">
            <div className="section-header">
              <TruckIcon className="section-icon" />
              <h3 className="section-title">Vehicle</h3>
            </div>
            <div className="section-content">
              {loadingCars ? (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <span>Loading cars...</span>
                </div>
              ) : showCarSelector ? (
                <>
                  {errors.cars && (
                    <div className="field-error">
                      <ExclamationCircleIcon className="error-icon-small" />
                      <span>{errors.cars}</span>
                    </div>
                  )}

                  <div className={`form-field ${errors.car ? "has-error" : ""}`}>
                    <label htmlFor="carSelect" className="field-label">
                      Select Vehicle
                    </label>
                    <select
                      id="carSelect"
                      value={formData.car?._id || ""}
                      onChange={(e) => handleCarSelect(e.target.value)}
                      className="car-select"
                    >
                      <option key="default-car-option" value="" disabled>
                        Select a car
                      </option>
                      {availableCars.length > 0 ? (
                        availableCars.map((car) => (
                          <option key={`car-${car._id}`} value={car._id}>
                            {car.manufacturer} {car.model} - {car.license_plate} (${car.price_per_day}/day)
                          </option>
                        ))
                      ) : (
                        <option key="no-cars" value="" disabled>
                          No cars available for selected dates
                        </option>
                      )}
                    </select>
                    {errors.car && (
                      <div className="field-error">
                        <ExclamationCircleIcon className="error-icon-small" />
                        <span>{errors.car}</span>
                      </div>
                    )}
                  </div>

                  {formData.car && formData.car._id && (
                    <div className="selected-car">
                      <div className="car-card">
                        <div className="car-image">
                          {formData.car.image ? (
                            <img
                              src={formData.car.image || "/placeholder.svg"}
                              alt={`${formData.car.manufacturer} ${formData.car.model}`}
                            />
                          ) : (
                            <div className="car-placeholder">
                              <TruckIcon className="placeholder-icon" />
                            </div>
                          )}
                        </div>
                        <div className="car-details">
                          <p className="car-model">
                            {formData.car.manufacturer} {formData.car.model}
                          </p>
                          <p className="car-license">License: {formData.car.license_plate}</p>
                          <p className="car-year">Year: {formData.car.year || "N/A"}</p>
                          <p className="car-price">Daily Rate: {formatCurrency(formData.car.price_per_day)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-dates-message">
                  <p>Please select rental dates to see available cars</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="form-section pricing-section">
            <div className="section-header">
              <CurrencyDollarIcon className="section-icon" />
              <h3 className="section-title">Pricing</h3>
            </div>
            <div className="section-content">
              <div className="pricing-summary">
                <div className="price-row">
                  <span className="price-label">Daily Rate:</span>
                  <span className="price-value">{formatCurrency(formData.rentalPrice.dailyRate)}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Duration:</span>
                  <span className="price-value">
                    {calculateDuration(formData.rentalPeriod.startDate, formData.rentalPeriod.endDate)} days
                  </span>
                </div>
                <div className="price-divider"></div>
                <div className="price-row total">
                  <span className="price-label">Total:</span>
                  <span className="price-value">{formatCurrency(formData.rentalPrice.totalAmount)}</span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="paymentMethod" className="field-label">
                  Payment Method
                </label>
                <div className={`field-input-wrapper ${errors["paymentDetails.paymentMethod"] ? "has-error" : ""}`}>
                  <select
                    id="paymentMethod"
                    name="paymentDetails.paymentMethod"
                    value={formData.paymentDetails.paymentMethod}
                    onChange={handleChange}
                    className="payment-select"
                  >
                    <option key="payment-cash" value="cash">
                      Cash
                    </option>
                    <option key="payment-credit" value="credit card">
                      Credit Card
                    </option>
                    <option key="payment-debit" value="debit card">
                      Debit Card
                    </option>
                    <option key="payment-bank" value="bank transfer">
                      Bank Transfer
                    </option>
                  </select>
                </div>
                {errors["paymentDetails.paymentMethod"] && (
                  <div className="field-error">
                    <ExclamationCircleIcon className="error-icon-small" />
                    <span>{errors["paymentDetails.paymentMethod"]}</span>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="paymentStatus" className="field-label">
                  Payment Status
                </label>
                <div className="field-input-wrapper">
                  <select
                    id="paymentStatus"
                    name="paymentDetails.paymentStatus"
                    value={formData.paymentDetails.paymentStatus}
                    onChange={handleChange}
                    className="payment-select"
                  >
                    <option key="status-pending" value="pending">
                      Pending
                    </option>
                    <option key="status-paid" value="paid">
                      Paid
                    </option>
                    <option key="status-partial" value="partial">
                      Partially Paid
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="form-section notes-section">
            <div className="section-header">
              <DocumentTextIcon className="section-icon" />
              <h3 className="section-title">Notes</h3>
            </div>
            <div className="section-content">
              <div className="form-field">
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder="Enter any additional notes about this contract..."
                  className="notes-textarea"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="form-section photo-section">
            <div className="section-header">
              <PhotographIcon className="section-icon" />
              <h3 className="section-title">Contract Photo</h3>
            </div>
            <div className="section-content">
              <div className="form-field">
                <label htmlFor="contractPhoto" className="field-label">
                  Photo URL
                </label>
                <input
                  type="text"
                  id="contractPhoto"
                  name="contractPhoto"
                  value={formData.contractPhoto}
                  onChange={handleChange}
                  placeholder="Enter URL for contract photo..."
                  className="photo-input"
                />
              </div>

              {formData.contractPhoto && (
                <div className="contract-photo-preview">
                  <div className="photo-container">
                    <img
                      src={formData.contractPhoto || "/placeholder.svg"}
                      alt="Contract"
                      className="photo-preview"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg"
                        e.target.classList.add("error")
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button" disabled={isSubmitting}>
            <XIcon className="button-icon" />
            Cancel
          </button>

          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner-small"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <PlusCircleIcon className="button-icon" />
                <span>Create Contract</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateContractForm

