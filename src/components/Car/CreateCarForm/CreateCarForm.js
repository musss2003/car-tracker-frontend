"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { XIcon, ExclamationCircleIcon, PlusCircleIcon } from "@heroicons/react/solid"
import "./CreateCarForm.css"

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i)
const LICENSE_PLATE_REGEX = /^[A-Z0-9]{1,10}$/i
const CHASSIS_NUMBER_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i

const CreateCarForm = ({ onSave, onClose, manufacturers = [] }) => {
  // Form state
  const [car, setCar] = useState({
    manufacturer: "",
    model: "",
    year: CURRENT_YEAR,
    color: "#000000",
    license_plate: "",
    chassis_number: "",
    price_per_day: "",
    description: "",
    features: [],
    transmission: "automatic",
    fuel_type: "gasoline",
    seats: 5,
    image: "",
  })

  // Validation state
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newFeature, setNewFeature] = useState("")

  // Common car manufacturers for suggestions
  const commonManufacturers =
    manufacturers.length > 0
      ? manufacturers
      : ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Nissan", "Hyundai"]

  // Common car features
  const commonFeatures = [
    "Air Conditioning",
    "Bluetooth",
    "Navigation System",
    "Backup Camera",
    "Sunroof",
    "Leather Seats",
    "Heated Seats",
    "Cruise Control",
  ]

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Handle different input types
    const newValue = type === "checkbox" ? checked : value

    setCar((prev) => ({ ...prev, [name]: newValue }))

    // Mark field as touched
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }))
    }
  }

  // Add a new feature to the car
  const handleAddFeature = () => {
    if (newFeature.trim() && !car.features.includes(newFeature.trim())) {
      setCar((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  // Add a common feature to the car
  const handleAddCommonFeature = (feature) => {
    if (!car.features.includes(feature)) {
      setCar((prev) => ({
        ...prev,
        features: [...prev.features, feature],
      }))
    }
  }

  // Remove a feature from the car
  const handleRemoveFeature = (feature) => {
    setCar((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }))
  }

  // Validate the form
  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!car.manufacturer) newErrors.manufacturer = "Manufacturer is required"
    if (!car.model) newErrors.model = "Model is required"
    if (!car.year) newErrors.year = "Year is required"
    if (!car.license_plate) newErrors.license_plate = "License plate is required"

    // License plate format
    if (car.license_plate && !LICENSE_PLATE_REGEX.test(car.license_plate)) {
      newErrors.license_plate = "License plate format is invalid"
    }

    // Chassis number format (if provided)
    if (car.chassis_number && !CHASSIS_NUMBER_REGEX.test(car.chassis_number)) {
      newErrors.chassis_number = "Chassis number must be 17 characters (excluding I, O, Q)"
    }

    // Price validation
    if (car.price_per_day) {
      const price = Number.parseFloat(car.price_per_day)
      if (isNaN(price) || price <= 0) {
        newErrors.price_per_day = "Price must be a positive number"
      }
    } else {
      newErrors.price_per_day = "Price per day is required"
    }

    // Seats validation
    if (car.seats) {
      const seats = Number.parseInt(car.seats)
      if (isNaN(seats) || seats < 1 || seats > 10) {
        newErrors.seats = "Seats must be between 1 and 10"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    setTouched({
      manufacturer: true,
      model: true,
      year: true,
      color: true,
      license_plate: true,
      chassis_number: true,
      price_per_day: true,
      seats: true,
    })

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      setIsSubmitting(true)

      // Format the data before saving
      const carData = {
        ...car,
        year: Number.parseInt(car.year),
        price_per_day: Number.parseFloat(car.price_per_day),
        seats: Number.parseInt(car.seats),
      }

      await onSave(carData)
      toast.success("Car created successfully")
    } catch (error) {
      console.error("Error creating car:", error)
      toast.error("Failed to create car")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel with unsaved changes
  const handleCancel = () => {
    // Check if form has been modified
    const hasChanges = Object.keys(touched).length > 0

    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  // Validate on field change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm()
    }
  }, [car, touched])

  // Render form field with label and error message
  const renderField = (label, name, type = "text", options = {}) => {
    const { placeholder = "", min, max, step, list, autoComplete = "off", required = false } = options

    const hasError = !!errors[name]

    return (
      <div className={`form-field ${hasError ? "has-error" : ""}`}>
        <label htmlFor={name}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>

        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={car[name] || ""}
            onChange={handleChange}
            className={hasError ? "error" : ""}
            required={required}
          >
            {options.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={car[name] || ""}
            onChange={handleChange}
            placeholder={placeholder}
            className={hasError ? "error" : ""}
            rows={options.rows || 3}
            required={required}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={car[name] || ""}
            onChange={handleChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            list={list}
            autoComplete={autoComplete}
            className={hasError ? "error" : ""}
            required={required}
          />
        )}

        {hasError && (
          <div className="error-message">
            <ExclamationCircleIcon className="error-icon" />
            {errors[name]}
          </div>
        )}

        {options.helpText && !hasError && <div className="help-text">{options.helpText}</div>}
      </div>
    )
  }

  return (
    <div className="create-car-form-container">
      <div className="form-header">
        <h2>Add New Car</h2>
        <button type="button" className="close-button" onClick={handleCancel}>
          <XIcon className="icon" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="create-car-form">
        <div className="form-sections">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>

            <div className="form-row">
              {renderField("Manufacturer", "manufacturer", "text", {
                required: true,
                list: "manufacturers",
                placeholder: "e.g. Toyota",
              })}

              {renderField("Model", "model", "text", {
                required: true,
                placeholder: "e.g. Camry",
              })}
            </div>

            <datalist id="manufacturers">
              {commonManufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer} />
              ))}
            </datalist>

            <div className="form-row">
              {renderField("Year", "year", "select", {
                required: true,
                options: YEARS.map((year) => ({ value: year, label: year })),
              })}

              {renderField("Color", "color", "color", {
                required: true,
                helpText: "Select the car color",
              })}
            </div>

            <div className="form-row">
              {renderField("Transmission", "transmission", "select", {
                options: [
                  { value: "automatic", label: "Automatic" },
                  { value: "manual", label: "Manual" },
                  { value: "semi-automatic", label: "Semi-Automatic" },
                ],
              })}

              {renderField("Fuel Type", "fuel_type", "select", {
                options: [
                  { value: "gasoline", label: "Gasoline" },
                  { value: "diesel", label: "Diesel" },
                  { value: "electric", label: "Electric" },
                  { value: "hybrid", label: "Hybrid" },
                ],
              })}
            </div>

            <div className="form-row">
              {renderField("Number of Seats", "seats", "number", {
                min: 1,
                max: 10,
                helpText: "Number of passenger seats",
              })}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Registration Details</h3>

            <div className="form-row">
              {renderField("License Plate", "license_plate", "text", {
                required: true,
                placeholder: "e.g. ABC123",
                helpText: "Enter the license plate number",
              })}

              {renderField("Chassis Number", "chassis_number", "text", {
                placeholder: "e.g. 1HGCM82633A123456",
                helpText: "17-character VIN (Vehicle Identification Number)",
              })}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Pricing</h3>

            <div className="form-row">
              {renderField("Price Per Day ($)", "price_per_day", "number", {
                required: true,
                min: 0,
                step: "0.01",
                placeholder: "e.g. 49.99",
              })}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Features</h3>

            <div className="features-container">
              <div className="features-input">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                />
                <button type="button" className="add-feature-button" onClick={handleAddFeature}>
                  Add
                </button>
              </div>

              <div className="common-features">
                <p className="common-features-label">Common features:</p>
                <div className="common-features-list">
                  {commonFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      className={`common-feature ${car.features.includes(feature) ? "selected" : ""}`}
                      onClick={() =>
                        car.features.includes(feature) ? handleRemoveFeature(feature) : handleAddCommonFeature(feature)
                      }
                    >
                      {feature}
                      {car.features.includes(feature) ? " ✓" : " +"}
                    </button>
                  ))}
                </div>
              </div>

              {car.features.length > 0 && (
                <div className="selected-features">
                  <p className="selected-features-label">Selected features:</p>
                  <div className="features-list">
                    {car.features.map((feature) => (
                      <div key={feature} className="feature-tag">
                        <span>{feature}</span>
                        <button type="button" className="remove-feature" onClick={() => handleRemoveFeature(feature)}>
                          <XIcon className="icon" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>

            {renderField("Description", "description", "textarea", {
              rows: 3,
              placeholder: "Enter a description of the car...",
            })}

            {renderField("Image URL", "image", "text", {
              placeholder: "https://example.com/car-image.jpg",
              helpText: "Enter a URL for the car image (optional)",
            })}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Creating...
              </>
            ) : (
              <>
                <PlusCircleIcon className="icon" />
                Create Car
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCarForm

