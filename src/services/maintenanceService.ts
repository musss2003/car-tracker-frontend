import type { MaintenanceRecord, MaintenanceFormData, MaintenanceRecordWithCar } from "../types/Maintenance"

/**
 * Service for handling car maintenance-related API calls
 */
export const maintenanceService = {
  /**
   * Get maintenance records for a specific car
   * @param licensePlate - The license plate of the car
   * @returns Promise with array of maintenance records
   */
  async getCarMaintenanceRecords(licensePlate: string): Promise<MaintenanceRecord[]> {
    try {
      const response = await fetch(`/api/cars/${licensePlate}/maintenance`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch maintenance records")
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getCarMaintenanceRecords:", error)
      throw error
    }
  },

  /**
   * Add a new maintenance record for a car
   * @param licensePlate - The license plate of the car
   * @param maintenanceData - The maintenance record data
   * @returns Promise with the created maintenance record
   */
  async addMaintenanceRecord(licensePlate: string, maintenanceData: MaintenanceFormData): Promise<MaintenanceRecord> {
    try {
      const response = await fetch(`/api/cars/${licensePlate}/maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(maintenanceData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add maintenance record")
      }

      return await response.json()
    } catch (error) {
      console.error("Error in addMaintenanceRecord:", error)
      throw error
    }
  },

  /**
   * Delete a maintenance record
   * @param id - The ID of the maintenance record to delete
   * @returns Promise with success message
   */
  async deleteMaintenanceRecord(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete maintenance record")
      }

      return await response.json()
    } catch (error) {
      console.error("Error in deleteMaintenanceRecord:", error)
      throw error
    }
  },

  /**
   * Get upcoming maintenance for all cars
   * @returns Promise with array of upcoming maintenance records
   */
  async getUpcomingMaintenance(): Promise<MaintenanceRecordWithCar[]> {
    try {
      const response = await fetch("/api/maintenance/upcoming")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch upcoming maintenance")
      }

      return await response.json()
    } catch (error) {
      console.error("Error in getUpcomingMaintenance:", error)
      throw error
    }
  },
}

export default maintenanceService
