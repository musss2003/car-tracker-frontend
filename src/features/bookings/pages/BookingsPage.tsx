import { useEffect, useState } from 'react';
import { logError } from '@/shared/utils/logger';
import {
  logAudit,
  AuditAction,
  AuditOutcome,
  sanitizeAuditMetadata,
} from '@/shared/utils/audit';
import {
  validateCancellationReason,
  sanitizeSearchQuery,
} from '@/shared/utils/validation';
import { validateId } from '@/shared/utils/inputValidator';
import { toast } from 'react-toastify';
import {
  FilterIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentIcon,
  CheckIcon,
} from '@heroicons/react/solid';

// shadcn/ui imports
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import Skeleton from '@/shared/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/booking.types';
import { BookingStatus } from '../types/booking.types';

// Status badge configuration (outside component to prevent recreation on every render)
const statusConfigMap = {
  [BookingStatus.PENDING]: {
    variant: 'secondary' as const,
    icon: ClockIcon,
    label: 'Pending',
  },
  [BookingStatus.CONFIRMED]: {
    variant: 'default' as const,
    icon: CheckCircleIcon,
    label: 'Confirmed',
  },
  [BookingStatus.CANCELLED]: {
    variant: 'destructive' as const,
    icon: XCircleIcon,
    label: 'Cancelled',
  },
  [BookingStatus.CONVERTED]: {
    variant: 'default' as const,
    icon: DocumentIcon,
    label: 'Converted',
  },
  [BookingStatus.EXPIRED]: {
    variant: 'outline' as const,
    icon: ClockIcon,
    label: 'Expired',
  },
};

const BookingsPage = () => {
  const navigate = useNavigate();

  // State management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBookings, setTotalBookings] = useState<number>(0);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [filterCar, setFilterCar] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterDepositPaid, setFilterDepositPaid] = useState<string>('all');
  const [filterMinCost, setFilterMinCost] = useState<string>('');
  const [filterMaxCost, setFilterMaxCost] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'createdAt',
    direction: 'desc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fetch bookings data with server-side filtering, sorting, and pagination
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for server-side processing
      const queryParams: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };

      // Add filters only if they have values
      if (searchTerm) queryParams.search = sanitizeSearchQuery(searchTerm);
      if (filterStatus && filterStatus !== 'all')
        queryParams.status = filterStatus;
      if (filterCustomer)
        queryParams.customerSearch = sanitizeSearchQuery(filterCustomer);
      if (filterCar) queryParams.carSearch = sanitizeSearchQuery(filterCar);
      if (filterStartDate) queryParams.startDate = filterStartDate;
      if (filterEndDate) {
        // Adjust end date to include the entire day (23:59:59.999)
        const endOfDay = new Date(filterEndDate);
        endOfDay.setHours(23, 59, 59, 999);
        queryParams.endDate = endOfDay.toISOString();
      }
      if (filterDepositPaid && filterDepositPaid !== 'all') {
        queryParams.depositPaid = filterDepositPaid === 'paid';
      }
      if (filterMinCost) queryParams.minCost = parseFloat(filterMinCost);
      if (filterMaxCost) queryParams.maxCost = parseFloat(filterMaxCost);

      const response = await bookingService.getAllBookings(queryParams);
      setBookings(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalBookings(response.total || 0);
    } catch (err) {
      const errorMessage = 'Failed to fetch bookings';
      setError(errorMessage);
      logError(errorMessage, err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when any filter, sort, or pagination parameter changes
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    filterStatus,
    filterCustomer,
    filterCar,
    filterStartDate,
    filterEndDate,
    filterDepositPaid,
    filterMinCost,
    filterMaxCost,
    sortConfig,
  ]);

  // Server-side processing eliminates the need for client-side filtering, sorting, and pagination
  // The `bookings` state already contains the processed data from the backend

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage((prev) => (prev !== 1 ? 1 : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    filterStatus,
    filterCustomer,
    filterCar,
    filterStartDate,
    filterEndDate,
    filterDepositPaid,
    filterMinCost,
    filterMaxCost,
    itemsPerPage,
  ]);

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Get status badge color and icon
  const getStatusBadge = (status: BookingStatus) => {
    const cfg =
      statusConfigMap[status] || statusConfigMap[BookingStatus.PENDING];
    const Icon = cfg.icon;

    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  // Handle confirm booking
  const handleConfirm = async (booking: Booking) => {
    // Input validation
    try {
      validateId(booking._id || '', 'booking ID');
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Invalid booking ID';
      toast.error(errorMsg);
      logAudit({
        action: AuditAction.BOOKING_CONFIRMED,
        outcome: AuditOutcome.FAILURE,
        resourceType: 'booking',
        resourceId: booking._id || 'unknown',
        errorMessage: errorMsg,
      });
      return;
    }

    try {
      await bookingService.confirmBooking(booking._id);

      // Audit log - SUCCESS
      logAudit({
        action: AuditAction.BOOKING_CONFIRMED,
        outcome: AuditOutcome.SUCCESS,
        resourceType: 'booking',
        resourceId: booking._id,
        metadata: sanitizeAuditMetadata({
          bookingReference: booking.bookingReference,
          previousStatus: booking.status,
        }),
      });

      toast.success('Booking confirmed successfully');

      // Update local state instead of re-fetching all bookings
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === booking._id ? { ...b, status: BookingStatus.CONFIRMED } : b
        )
      );
    } catch (err) {
      const errorMessage = 'Failed to confirm booking';

      // Audit log - FAILURE
      logAudit({
        action: AuditAction.BOOKING_CONFIRMED,
        outcome: AuditOutcome.FAILURE,
        resourceType: 'booking',
        resourceId: booking._id,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      });

      logError(errorMessage, err);
      toast.error(errorMessage);
    }
  };

  // Handle cancel booking
  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancellationReason('');
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) {
      toast.error('No booking selected for cancellation');
      return;
    }

    // Validate booking ID
    try {
      validateId(bookingToCancel._id || '', 'booking ID');
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Invalid booking ID';
      toast.error(errorMsg);
      logAudit({
        action: AuditAction.BOOKING_CANCELLED,
        outcome: AuditOutcome.FAILURE,
        resourceType: 'booking',
        resourceId: bookingToCancel._id || 'unknown',
        errorMessage: errorMsg,
      });
      return;
    }

    // Validate and sanitize cancellation reason
    const validation = validateCancellationReason(cancellationReason);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid cancellation reason');
      return;
    }

    const sanitizedReason = validation.sanitized!;

    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(bookingToCancel._id, sanitizedReason);

      // Audit log - SUCCESS
      logAudit({
        action: AuditAction.BOOKING_CANCELLED,
        outcome: AuditOutcome.SUCCESS,
        resourceType: 'booking',
        resourceId: bookingToCancel._id,
        metadata: sanitizeAuditMetadata({
          bookingReference: bookingToCancel.bookingReference,
          previousStatus: bookingToCancel.status,
          reasonLength: sanitizedReason.length,
        }),
      });

      toast.success('Booking cancelled successfully');
      setShowCancelDialog(false);
      setBookingToCancel(null);
      setCancellationReason('');

      // Optimistic update: Update local state instead of re-fetching
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === bookingToCancel._id
            ? {
                ...b,
                status: BookingStatus.CANCELLED,
                cancelledAt: new Date().toISOString(),
                cancellationReason: sanitizedReason,
              }
            : b
        )
      );
    } catch (err) {
      const errorMessage = 'Failed to cancel booking';

      // Audit log - FAILURE
      logAudit({
        action: AuditAction.BOOKING_CANCELLED,
        outcome: AuditOutcome.FAILURE,
        resourceType: 'booking',
        resourceId: bookingToCancel._id,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      });

      logError(errorMessage, err);
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} - ${end}`;
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCustomer('');
    setFilterCar('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterDepositPaid('all');
    setFilterMinCost('');
    setFilterMaxCost('');
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    (filterStatus && filterStatus !== 'all') ||
    filterCustomer ||
    filterCar ||
    filterStartDate ||
    filterEndDate ||
    (filterDepositPaid && filterDepositPaid !== 'all') ||
    filterMinCost ||
    filterMaxCost;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage and track all reservation bookings
          </p>
        </div>
        <Button onClick={() => navigate('/bookings/new')} size="default">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Booking
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by Reference */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Booking Reference</label>
            <Input
              placeholder="Search by reference..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(sanitizeSearchQuery(e.target.value))
              }
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={BookingStatus.CONFIRMED}>
                  Confirmed
                </SelectItem>
                <SelectItem value={BookingStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
                <SelectItem value={BookingStatus.CONVERTED}>
                  Converted
                </SelectItem>
                <SelectItem value={BookingStatus.EXPIRED}>Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <Input
              placeholder="Search by customer..."
              value={filterCustomer}
              onChange={(e) =>
                setFilterCustomer(sanitizeSearchQuery(e.target.value))
              }
            />
          </div>

          {/* Car Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Car</label>
            <Input
              placeholder="Search by car..."
              value={filterCar}
              onChange={(e) =>
                setFilterCar(sanitizeSearchQuery(e.target.value))
              }
            />
          </div>

          {/* Start Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date From</label>
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>

          {/* End Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date Until</label>
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>

          {/* Deposit Paid Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Deposit Status</label>
            <Select
              value={filterDepositPaid}
              onValueChange={setFilterDepositPaid}
            >
              <SelectTrigger>
                <SelectValue placeholder="All deposits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deposits</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Cost Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Cost ($)</label>
            <Input
              type="number"
              placeholder="Min cost..."
              value={filterMinCost}
              onChange={(e) => setFilterMinCost(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Max Cost Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Cost ($)</label>
            <Input
              type="number"
              placeholder="Max cost..."
              value={filterMaxCost}
              onChange={(e) => setFilterMaxCost(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {bookings.length} of {totalBookings} bookings
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Show:</label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <XCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Bookings
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchBookings}>Try Again</Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'No bookings match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first booking.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => navigate('/bookings/create')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Booking
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('bookingReference')}
                >
                  <div className="flex items-center gap-2">
                    Reference
                    {sortConfig.key === 'bookingReference' &&
                      (sortConfig.direction === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-2">
                    Customer
                    {sortConfig.key === 'customer' &&
                      (sortConfig.direction === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('car')}
                >
                  <div className="flex items-center gap-2">
                    Car
                    {sortConfig.key === 'car' &&
                      (sortConfig.direction === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center gap-2">
                    Date Range
                    {sortConfig.key === 'startDate' &&
                      (sortConfig.direction === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortConfig.key === 'status' &&
                      (sortConfig.direction === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">
                    {booking.bookingReference}
                  </TableCell>
                  <TableCell>
                    {booking.customer?.name || booking.customerId}
                  </TableCell>
                  <TableCell>
                    {booking.car
                      ? `${booking.car.licensePlate} - ${booking.car.manufacturer} ${booking.car.model}`
                      : booking.carId}
                  </TableCell>
                  <TableCell>
                    {formatDateRange(booking.startDate, booking.endDate)}
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {booking.status === BookingStatus.PENDING && (
                          <DropdownMenuItem
                            onClick={() => handleConfirm(booking)}
                          >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {(booking.status === BookingStatus.PENDING ||
                          booking.status === BookingStatus.CONFIRMED) && (
                          <DropdownMenuItem
                            onClick={() => handleCancelClick(booking)}
                            className="text-destructive"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalBookings > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {bookings.length} of {totalBookings} total bookings (Page{' '}
            {currentPage} of {totalPages})
          </p>
          <div className="flex gap-2">
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling this booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Cancellation reason..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isCancelling || !cancellationReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingsPage;
