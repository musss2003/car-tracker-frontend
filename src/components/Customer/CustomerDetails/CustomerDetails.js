"use client"

import { useState } from "react"
import {
  XIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LocationMarkerIcon,
  IdentificationIcon,
  PhotographIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationIcon,
} from "@heroicons/react/solid"
import "./CustomerDetails.css"

const CustomerDetails = ({ customer, onEdit, onDelete, onClose }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [expandedImage, setExpandedImage] = useState(null)

  // Handle missing or null values
  const getValue = (value, defaultValue = "N/A") => {
    return value || defaultValue
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "N/A"
    }
  }

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  // Handle image expansion
  const expandImage = (imageUrl, type) => {
    if (!imageUrl) return
    setExpandedImage({ url: imageUrl, type })
  }

  const closeExpandedImage = () => {
    setExpandedImage(null)
  }

  // Check if customer object is valid
  if (!customer || Object.keys(customer).length === 0) {
    return (
      <div className="customer-details-container">
        <div className="details-header">
          <h2 className="details-title">Customer Details</h2>
          <button className="close-button" onClick={onClose}>
            <XIcon className="icon" />
          </button>
        </div>
        <div className="empty-details">
          <p>No customer details available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-details-container">
      {/* Header */}
      <div className="details-header">
        <div className="header-content">
          <h2 className="details-title">Customer Details</h2>
          {customer.createdAt && (
            <div className="customer-created-date">
              <ClockIcon className="icon-small" />
              <span>Added on {formatDate(customer.createdAt)}</span>
            </div>
          )}
        </div>
        <button className="close-button" onClick={onClose}>
          <XIcon className="icon" />
        </button>
      </div>

      {/* Customer Avatar and Name */}
      <div className="customer-header">
        <div className="customer-avatar">{customer.name ? customer.name.charAt(0).toUpperCase() : "?"}</div>
        <h3 className="customer-name">{getValue(customer.name)}</h3>
      </div>

      {/* Delete Confirmation (Inline) */}
      {showDeleteConfirm && (
        <div className="delete-confirm-section">
          <div className="delete-confirm-content">
            <ExclamationIcon className="warning-icon" />
            <div className="confirm-text">
              <h4>Confirm Deletion</h4>
              <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
            </div>
            <div className="confirm-actions">
              <button className="confirm-button cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-button delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image (Inline) */}
      {expandedImage && (
        <div className="expanded-image-section">
          <div className="expanded-image-header">
            <h3 className="expanded-image-title">{expandedImage.type}</h3>
            <button className="close-button" onClick={closeExpandedImage}>
              <XIcon className="icon" />
            </button>
          </div>
          <div className="expanded-image-content">
            <img
              src={expandedImage.url || "/placeholder.svg"}
              alt={expandedImage.type}
              className="expanded-image"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg"
                e.target.classList.add("error-image")
              }}
            />
          </div>
        </div>
      )}

      {/* Details Sections - Only show if no expanded image or delete confirmation */}
      {!expandedImage && !showDeleteConfirm && (
        <div className="details-body">
          {/* Personal Information */}
          <div className="details-section">
            <div className="section-header">
              <UserIcon className="section-icon" />
              <h3 className="section-title">Personal Information</h3>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <MailIcon className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{getValue(customer.email)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <PhoneIcon className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{getValue(customer.phone_number || customer.phone)}</span>
                  </div>
                </div>
                <div className="info-item full-width">
                  <LocationMarkerIcon className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Address</span>
                    <span className="info-value">{getValue(customer.address)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="details-section">
            <div className="section-header">
              <IdentificationIcon className="section-icon" />
              <h3 className="section-title">Identification</h3>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <DocumentTextIcon className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Driver License</span>
                    <span className="info-value">{getValue(customer.driver_license_number)}</span>
                  </div>
                </div>
                <div className="info-item">
                  <DocumentTextIcon className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Passport Number</span>
                    <span className="info-value">{getValue(customer.passport_number)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Photos */}
          {(customer.drivingLicensePhotoUrl || customer.passportPhotoUrl) && (
            <div className="details-section">
              <div className="section-header">
                <PhotographIcon className="section-icon" />
                <h3 className="section-title">Document Photos</h3>
              </div>
              <div className="section-content">
                <div className="documents-grid">
                  {customer.drivingLicensePhotoUrl && (
                    <div className="document-item">
                      <h4 className="document-title">Driver License</h4>
                      <div className="document-image-container">
                        <img
                          src={customer.drivingLicensePhotoUrl || "/placeholder.svg"}
                          alt="Driver License"
                          className="document-image"
                          onClick={() => expandImage(customer.drivingLicensePhotoUrl, "Driver License")}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.svg"
                            e.target.classList.add("error-image")
                          }}
                        />
                        <div className="image-overlay">
                          <span>Click to enlarge</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {customer.passportPhotoUrl && (
                    <div className="document-item">
                      <h4 className="document-title">Passport</h4>
                      <div className="document-image-container">
                        <img
                          src={customer.passportPhotoUrl || "/placeholder.svg"}
                          alt="Passport"
                          className="document-image"
                          onClick={() => expandImage(customer.passportPhotoUrl, "Passport")}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.svg"
                            e.target.classList.add("error-image")
                          }}
                        />
                        <div className="image-overlay">
                          <span>Click to enlarge</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {customer.notes && (
            <div className="details-section">
              <div className="section-header">
                <DocumentTextIcon className="section-icon" />
                <h3 className="section-title">Notes</h3>
              </div>
              <div className="section-content">
                <p className="notes-text">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="details-footer">
        <button className="action-button edit" onClick={onEdit}>
          <PencilIcon className="button-icon" />
          Edit Customer
        </button>
        {!showDeleteConfirm && (
          <button className="action-button delete" onClick={handleDeleteClick}>
            <TrashIcon className="button-icon" />
            Delete Customer
          </button>
        )}
      </div>
    </div>
  )
}

export default CustomerDetails

