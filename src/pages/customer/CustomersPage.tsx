"use client"

import { useState, useEffect, useMemo } from "react"
import { deleteCustomer, getCustomers } from "../../services/customerService"
import { toast } from "react-toastify"
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  DownloadIcon,
} from "@heroicons/react/solid"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"

// shadcn/ui imports
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Skeleton from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type { Customer } from "@/types/Customer"

const CustomersPage = () => {
  const navigate = useNavigate()

  // State management
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer
    direction: "asc" | "desc"
  }>({
    key: "name",
    direction: "asc",
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await getCustomers()
      setCustomers(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch customers:", err)
      setError("Failed to load customers. Please try again later.")
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    // First, filter the customers
    let result = [...customers];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (customer) =>
          (customer.name &&
            customer.name.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.driverLicenseNumber &&
            customer.driverLicenseNumber
              .toLowerCase()
              .includes(lowerSearchTerm)) ||
          (customer.passportNumber &&
            customer.passportNumber.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.email &&
            customer.email.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.phoneNumber &&
            customer.phoneNumber.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.address &&
            customer.address.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.countryOfOrigin &&
            customer.countryOfOrigin.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Then, sort the filtered results
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        // Handle null or undefined values
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        // Fallback if types mismatch
        return 0;
      });
    }

    return result;
  }, [customers, searchTerm, sortConfig]);

  // Pagination logic
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCustomers.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedCustomers.length / itemsPerPage
  );

  // Event handlers
  const handleSort = (key: keyof Customer) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      setLoading(true)
      if (customer.id) {
        await deleteCustomer(customer.id)
        await fetchCustomers()
        toast.success("Customer deleted successfully")
        setShowDeleteDialog(false)
        setCustomerToDelete(null)
      } else {
        toast.error("No customer selected or customer ID is missing.")
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Failed to delete customer")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    navigate("/customers/new")
  }

  const handleViewDetails = (customer: Customer) => {
    navigate(`/customers/${customer.id}`)
  }

  const handleEdit = (customer: Customer) => {
    navigate(`/customers/${customer.id}/edit`)
  }

  // Export to Excel
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      const worksheetData = filteredAndSortedCustomers.map((customer) => ({
        Ime: customer.name || 'N/A',
        'Vozačka dozvola': customer.driverLicenseNumber || 'N/A',
        'Broj pasoša': customer.passportNumber || 'N/A',
        Email: customer.email || 'N/A',
        Telefon: customer.phoneNumber || 'N/A',
        Adresa: customer.address || 'N/A',
        'Zemlja porijekla': customer.countryOfOrigin || 'N/A',
        'Datum kreiranja': customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString()
          : 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Korisnici');
      XLSX.writeFile(workbook, 'korisnici.xlsx');
      toast.success('Excel uspješno izvezen');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Excel neuspješno izvezen');
    }
  };

  // Render table header with sort indicators
  const renderTableHeader = (label: string, key: keyof Customer) => {
    const isSorted = sortConfig.key === key

    return (
      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(key)}>
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isSorted ? (
            sortConfig.direction === "asc" ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )
          ) : (
            <ChevronUpIcon className="w-4 h-4 opacity-30" />
          )}
        </div>
      </TableHead>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToExcel}>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleCreate} disabled={loading}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-6 py-4 border-b bg-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, passport, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {error && <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mt-4">{error}</div>}
      </div>

      {/* Table Section */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderTableHeader("Name", "name")}
                    {renderTableHeader("Driver License", "driverLicenseNumber")}
                    {renderTableHeader("Passport", "passportNumber")}
                    {renderTableHeader("Email", "email")}
                    {renderTableHeader("Phone", "phoneNumber")}
                    {renderTableHeader("Country", "countryOfOrigin")}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer, index) => {
                      return (
                        <TableRow key={customer.id || index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{customer.name?.charAt(0) || "?"}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{customer.name || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{customer.driverLicenseNumber || "N/A"}</TableCell>
                          <TableCell>{customer.passportNumber || "N/A"}</TableCell>
                          <TableCell>{customer.email || "N/A"}</TableCell>
                          <TableCell>{customer.phoneNumber || "N/A"}</TableCell>
                          <TableCell>{customer.countryOfOrigin || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(customer)}
                                title="View Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleEdit(customer)
                                }}
                                title="Edit Customer"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setCustomerToDelete(customer)
                                  setShowDeleteDialog(true)
                                }}
                                title="Delete Customer"
                              >
                                <TrashIcon className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No customers match your search criteria" : "No customers available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              {customerToDelete && (
                <span className="font-medium">
                  {" "}
                  {customerToDelete.name} ({customerToDelete.email})
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCustomerToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              className="bg-red-500 text-white"
              onClick={() => {
                if (customerToDelete) {
                  handleDeleteCustomer(customerToDelete)
                }
              }}
              disabled={!customerToDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CustomersPage;
