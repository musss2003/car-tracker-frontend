"use client"

import { useEffect, useState, useCallback } from "react"
import {
  BellIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  XIcon,
  SearchIcon,
  FilterIcon,
  RefreshIcon,
  DotsVerticalIcon,
} from "@heroicons/react/solid"
import { getNotifications, markAllAsSeen, markAsSeen, deleteNotification } from "../../../services/notificationService"
import { toast } from "react-toastify"
import "./NotificationList.css"

// Notification type icons mapping
const typeIcons = {
  info: <InformationCircleIcon className="notification-icon info" />,
  success: <CheckCircleIcon className="notification-icon success" />,
  warning: <ExclamationIcon className="notification-icon warning" />,
  error: <ExclamationIcon className="notification-icon error" />,
  default: <BellIcon className="notification-icon default" />,
}

function NotificationList() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // 'all', 'new', 'seen'
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedNotification, setExpandedNotification] = useState(null)
  const [actionInProgress, setActionInProgress] = useState(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const notificationsData = await getNotifications()
      setNotifications(notificationsData)
    } catch (err) {
      setError(err.message || "Failed to load notifications")
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchNotifications()
      toast.success("Notifications refreshed")
    } catch (error) {
      // Error is already handled in fetchNotifications
    } finally {
      setIsRefreshing(false)
    }
  }

  // Mark notification as seen
  const handleMarkAsSeen = async (notificationId) => {
    setActionInProgress(notificationId)
    try {
      await markAsSeen(notificationId)

      // Update the notification status locally (optimistic update)
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, status: "seen" } : notif)),
      )
      toast.success("Notification marked as read")
    } catch (err) {
      console.error(err.message)
      toast.error("Failed to mark notification as read")
    } finally {
      setActionInProgress(null)
    }
  }

  // Mark all notifications as seen
  const handleMarkAllAsSeen = async () => {
    if (notifications.filter((n) => n.status === "new").length === 0) {
      toast.info("No new notifications to mark as read")
      return
    }

    setActionInProgress("all")
    try {
      await markAllAsSeen()

      // Update all notifications locally
      setNotifications((prev) => prev.map((notif) => ({ ...notif, status: "seen" })))
      toast.success("All notifications marked as read")
    } catch (err) {
      console.error(err.message)
      toast.error("Failed to mark all notifications as read")
    } finally {
      setActionInProgress(null)
    }
  }

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return
    }

    setActionInProgress(notificationId)
    try {
      await deleteNotification(notificationId)

      // Remove the notification locally
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId))
      toast.success("Notification deleted")
    } catch (err) {
      console.error(err.message)
      toast.error("Failed to delete notification")
    } finally {
      setActionInProgress(null)
    }
  }

  // Toggle expanded notification
  const toggleExpandNotification = (notificationId) => {
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Filter and search notifications
  const filteredNotifications = notifications.filter((notif) => {
    // Apply status filter
    if (filter !== "all" && notif.status !== filter) return false

    // Apply search filter
    if (
      searchTerm &&
      !notif.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !notif.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    return true
  })

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let groupKey

    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday"
    } else {
      groupKey = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }

    groups[groupKey].push(notification)
    return groups
  }, {})

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    return typeIcons[type.toLowerCase()] || typeIcons.default
  }

  // Count new notifications
  const newNotificationsCount = notifications.filter((n) => n.status === "new").length

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="notifications-title">
          <h1>Notifications</h1>
          {newNotificationsCount > 0 && <span className="new-badge">{newNotificationsCount} new</span>}
        </div>

        <div className="notifications-actions">
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            aria-label="Refresh notifications"
          >
            <RefreshIcon className={`icon ${isRefreshing ? "spinning" : ""}`} />
          </button>

          <button
            className="mark-all-button"
            onClick={handleMarkAllAsSeen}
            disabled={
              actionInProgress === "all" || loading || notifications.filter((n) => n.status === "new").length === 0
            }
            aria-label="Mark all as read"
          >
            {actionInProgress === "all" ? (
              <span className="loading-spinner small"></span>
            ) : (
              <>
                <CheckIcon className="icon" />
                <span className="button-text">Mark All as Read</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")} aria-label="Clear search">
              <XIcon className="icon-small" />
            </button>
          )}
        </div>

        <div className="filter-container">
          <FilterIcon className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Notifications</option>
            <option value="new">Unread</option>
            <option value="seen">Read</option>
          </select>
        </div>
      </div>

      {loading && !isRefreshing && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <ExclamationIcon className="error-icon" />
          <p>{error}</p>
          <button onClick={fetchNotifications} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {!loading && filteredNotifications.length === 0 && (
        <div className="empty-container">
          <BellIcon className="empty-icon" />
          <h3>No notifications found</h3>
          <p>
            {searchTerm || filter !== "all"
              ? "Try changing your search or filter settings"
              : "You don't have any notifications yet"}
          </p>
        </div>
      )}

      <div className="notifications-content">
        {Object.entries(groupedNotifications).map(([date, notifs]) => (
          <div key={date} className="notification-group">
            <div className="group-header">
              <h2>{date}</h2>
            </div>

            <ul className="notifications-list">
              {notifs.map((notif) => (
                <li
                  key={notif._id}
                  className={`notification-item ${notif.status === "new" ? "unread" : ""} ${expandedNotification === notif._id ? "expanded" : ""}`}
                >
                  <div className="notification-main" onClick={() => toggleExpandNotification(notif._id)}>
                    <div className="notification-icon-container">{getNotificationIcon(notif.type)}</div>

                    <div className="notification-content">
                      <div className="notification-header">
                        <span className="notification-type">{notif.type}</span>
                        <span className="notification-time">{formatDate(notif.createdAt)}</span>
                      </div>

                      <p className="notification-message">{notif.message}</p>

                      {notif.status === "new" && <span className="status-indicator"></span>}
                    </div>

                    <div className="notification-actions">
                      <button
                        className="action-menu-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpandNotification(notif._id)
                        }}
                        aria-label="Toggle notification details"
                      >
                        <DotsVerticalIcon className="icon-small" />
                      </button>
                    </div>
                  </div>

                  {expandedNotification === notif._id && (
                    <div className="notification-details">
                      <div className="notification-meta">
                        <p>
                          <strong>Created:</strong> {new Date(notif.createdAt).toLocaleString()}
                        </p>
                        {notif.entityType && (
                          <p>
                            <strong>Related to:</strong> {notif.entityType}
                          </p>
                        )}
                        {notif.entityId && (
                          <p>
                            <strong>ID:</strong> {notif.entityId}
                          </p>
                        )}
                      </div>

                      <div className="notification-buttons">
                        {notif.status === "new" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsSeen(notif._id)
                            }}
                            className="mark-button"
                            disabled={actionInProgress === notif._id}
                          >
                            {actionInProgress === notif._id ? (
                              <span className="loading-spinner small"></span>
                            ) : (
                              <>
                                <CheckIcon className="icon-small" />
                                Mark as Read
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notif._id)
                          }}
                          className="delete-button"
                          disabled={actionInProgress === notif._id}
                        >
                          {actionInProgress === notif._id ? (
                            <span className="loading-spinner small"></span>
                          ) : (
                            <>
                              <XIcon className="icon-small" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationList

