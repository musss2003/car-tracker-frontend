"use client"

import { useState, useEffect } from "react"
import { getAvailableCarsForPeriod } from "../../../services/carService"
import { searchCustomersByName } from "../../../services/customerService"
import {
  XIcon,
  SaveIcon,
  UserIcon,
  CalendarIcon,
  TruckIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PhotographIcon,
  SearchIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/solid"
import "./EditContractForm.css"

const EditContractForm = ({ contract, onCancel, onSave }) => {
  // Define YEARS array for any year dropdowns
  const YEARS = Array.from({ length: new Date().getFullYear() - 1950 + 1 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: new Date().getFullYear() - i,
  }))

  // Form state
  const [formData, setFormData] = useState({
    _id: contract._id,
    customer: contract.customer,
    car: contract.car,
    rentalPeriod: {
      startDate: contract.rentalPeriod.startDate.split("T")[0],
      endDate: contract.rentalPeriod.endDate.split("T")[0],
    },
    rentalPrice: {
      dailyRate: contract.rentalPrice.dailyRate,
      totalAmount: contract.rentalPrice.totalAmount,
    },
    additionalNotes: contract.additionalNotes || "",
    contractPhoto: contract.contractPhoto || "",
  })

  // UI state
  const [availableCars, setAvailableCars] = useState([])
  const [loadingCars, setLoadingCars] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerSearch, setCustomerSearch] = useState(contract.customer.name || "")
  const [customerResults, setCustomerResults] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCarSelector, setShowCarSelector] = useState(true)
  const [originalCarId, setOriginalCarId] = useState(contract.car._id)

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

  // Fetch available cars when dates change
  useEffect(() => {
    if (formData.rentalPeriod.startDate && formData.rentalPeriod.endDate) {
      fetchCarsForPeriod(formData.rentalPeriod.startDate, formData.rentalPeriod.endDate)
    }
  }, [formData.rentalPeriod])

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
  }

  // Fetch available cars for the selected period
  const fetchCarsForPeriod = async (startDate, endDate) => {
    setLoadingCars(true)
    try {
      const cars = await getAvailableCarsForPeriod(startDate, endDate)

      // Add the original car to the list if it's not already included
      const originalCarIncluded = cars.some((car) => car._id === originalCarId)

      if (!originalCarIncluded) {
        setAvailableCars([...cars, formData.car])
      } else {
        setAvailableCars(cars)
      }

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
      console.error("Error updating contract:", error)
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to update contract. Please try again.",
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get contract status
  const getContractStatus = () => {
    const now = new Date()
    const startDate = new Date(formData.rentalPeriod.startDate)
    const endDate = new Date(formData.rentalPeriod.endDate)

    if (now < startDate) {
      return { status: "Confirmed", className: "status-confirmed", icon: <ClockIcon className="status-icon" /> }
    } else if (now >= startDate && now <= endDate) {
      return { status: "Active", className: "status-active", icon: <CheckCircleIcon className="status-icon" /> }
    } else {
      return { status: "Completed", className: "status-completed", icon: <CheckCircleIcon className="status-icon" /> }
    }
  }

  const { status, className, icon } = getContractStatus()

  const renderField = (label, name, type = "text", options = {}, required = false) => {
    const hasError = errors[name]
    return (
      <div className="form-field">
        <label htmlFor={name} className="field-label">
          {label}
        </label>
        <div className={`field-input-wrapper ${hasError ? "has-error" : ""}`}>
          {type === "select" ? (
            <select
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className={hasError ? "error" : ""}
              required={required}
            >
              {options.options &&
                options.options.map((option) => (
                  <option key={`${name}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          ) : type === "textarea" ? (
            <textarea
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className="notes-textarea"
              rows={4}
              required={required}
            />
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className="photo-input"
              required={required}
            />
          )}
        </div>
        {hasError && (
          <div className="field-error">
            <ExclamationCircleIcon className="error-icon-small" />
            <span>{errors[name]}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="edit-contract-form-container">
      <div className="form-header">
        <div className="header-content">
          <h2 className="form-title">Edit Contract</h2>
          <div className={`contract-status ${className}`}>
            {icon}
            <span>{status}</span>
          </div>
        </div>
        <button type="button" className="close-button" onClick={onCancel}>
          <XIcon className="icon" />
        </button>
      </div>

      {errors.submit && (
        <div className="global-error">
          <ExclamationCircleIcon className="error-icon" />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-contract-form">
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
                      value={formData.car._id || ""}
                      onChange={(e) => handleCarSelect(e.target.value)}
                      className="car-select"
                    >
                      <option key="default-car-option" value="" disabled>
                      {formData.car.manufacturer} {formData.car.model} - {formData.car.license_plate} (${formData.car.price_per_day}/day)
                      </option>
                      {availableCars.map((car) => (
                        <option key={`car-${car._id}`} value={car._id}>
                          {car.manufacturer} {car.model} - {car.license_plate} (${car.price_per_day}/day)
                        </option>
                      ))}
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
          <button type="button" onClick={onCancel} className="cancel-button" disabled={isSubmitting}>
            <XIcon className="button-icon" />
            Cancel
          </button>

          <button type="submit" className="save-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner-small"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <SaveIcon className="button-icon" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditContractForm

