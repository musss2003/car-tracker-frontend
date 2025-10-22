'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  getContracts,
  deleteContract,
  downloadContract,
} from '@/services/contractService';
import { toast } from 'react-toastify';
import {
  FilterIcon,
  DocumentDownloadIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from '@heroicons/react/solid';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Skeleton from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useNavigate } from 'react-router-dom';
import type { Contract } from '@/types/Contract';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ContractsPage = () => {
  const navigate = useNavigate();
  // State management
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'rentalPeriod.startDate',
    direction: 'desc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fetch contracts data
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await getContracts();
      setContracts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
      setError('Failed to load contracts. Please try again later.');
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    let result = [...contracts];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (contract) =>
          contract.customer?.name?.toLowerCase().includes(lowerSearchTerm) ||
          contract.customer?.passportNumber?.includes(searchTerm) ||
          contract.car?.model?.toLowerCase().includes(lowerSearchTerm) ||
          contract.car?.licensePlate?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      result = result.filter((contract) => {
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);

        switch (filterStatus) {
          case 'confirmed':
            return now < startDate;
          case 'active':
            return now >= startDate && now <= endDate;
          case 'completed':
            return now > endDate;
          default:
            return true;
        }
      });
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: string | number | Date = '';
        let bValue: string | number | Date = '';

        if (sortConfig.key.includes('.')) {
          const [obj, prop] = sortConfig.key.split('.');

          if (obj === 'customer' && a.customer && b.customer) {
            aValue = (a.customer as any)[prop] ?? '';
            bValue = (b.customer as any)[prop] ?? '';
          } else if (obj === 'car' && a.car && b.car) {
            aValue = (a.car as any)[prop] ?? '';
            bValue = (b.car as any)[prop] ?? '';
          } else if (prop === 'startDate' || prop === 'endDate') {
            aValue = new Date((a as any)[prop]);
            bValue = new Date((b as any)[prop]);
          }
        } else {
          aValue = (a as any)[sortConfig.key] ?? '';
          bValue = (b as any)[sortConfig.key] ?? '';
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [contracts, searchTerm, filterStatus, sortConfig]);

  // Pagination logic
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedContracts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedContracts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedContracts.length / itemsPerPage
  );

  // Event handlers
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleDeleteContract = async (contract: Contract) => {
    try {
      setLoading(true);
      if (contract.id) {
        await deleteContract(contract.id);
        await fetchContracts();
        toast.success('Contract deleted successfully');
        setShowDeleteDialog(false);
      } else {
        toast.error('No contract selected or contract ID is missing.');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (contract: Contract): number => {
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    const rentalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailyRate =
      typeof contract.car.pricePerDay === 'string'
        ? Number.parseFloat(contract.car.pricePerDay)
        : contract.car.pricePerDay;
    return rentalDays * dailyRate;
  };

  const handleCreate = () => {
    navigate('/contracts/new');
  };

  const handleViewDetails = (contract: Contract) => {
    navigate(`/contracts/${contract.id}`);
  };

  const handleEdit = (contract: Contract) => {
    navigate(`/contracts/${contract.id}/edit`);
  };

  const handleDownloadContract = async (contract: Contract) => {
    try {
      if (contract.id) {
        await downloadContract(contract.id);
        toast.success('Contract download initiated');
      } else {
        toast.error('No contract selected or contract ID is missing.');
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast.error('Failed to download contract');
    }
  };

  // Export functions
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Contracts List', 20, 10);

      const tableColumn = [
        'Customer Name',
        'Passport Number',
        'Car Model',
        'License Plate',
        'Start Date',
        'End Date',
        'Status',
      ];
      const tableRows = filteredAndSortedContracts.map((contract) => {
        const now = new Date();
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);

        let status;
        if (now < startDate) status = 'Confirmed';
        else if (now >= startDate && now <= endDate) status = 'Active';
        else status = 'Completed';

        return [
          contract.customer?.name || 'N/A',
          contract.customer?.passportNumber || 'N/A',
          contract.car?.model || 'N/A',
          contract.car?.licensePlate || 'N/A',
          startDate.toLocaleDateString(),
          endDate.toLocaleDateString(),
          status,
        ];
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 135, 245] },
      });

      doc.save('contracts.pdf');
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheetData = filteredAndSortedContracts.map((contract) => {
        const now = new Date();
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);

        let status;
        if (now < startDate) status = 'Confirmed';
        else if (now >= startDate && now <= endDate) status = 'Active';
        else status = 'Completed';

        return {
          'Customer Name': contract.customer?.name || 'N/A',
          'Passport Number': contract.customer?.passportNumber || 'N/A',
          'Car Model': contract.car?.model || 'N/A',
          'License Plate': contract.car?.licensePlate || 'N/A',
          'Start Date': startDate.toLocaleDateString(),
          'End Date': endDate.toLocaleDateString(),
          'Total Price': contract ? `$${calculateTotalPrice(contract)}` : 'N/A',
          Status: status,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contracts');
      XLSX.writeFile(workbook, 'contracts.xlsx');
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel');
    }
  };

  // Helper function to determine contract status
  const getContractStatus = (contract: Contract) => {
    const now = new Date();
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);

    if (now < startDate)
      return {
        status: 'confirmed',
        label: 'Confirmed',
        variant: 'secondary' as const,
      };
    else if (now >= startDate && now <= endDate)
      return { status: 'active', label: 'Active', variant: 'default' as const };
    else
      return {
        status: 'completed',
        label: 'Completed',
        variant: 'outline' as const,
      };
  };

  const renderTableHeader = (label: string, key: string) => {
    const isSorted = sortConfig.key === key;

    return (
      <TableHead
        className="cursor-pointer select-none"
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isSorted ? (
            sortConfig.direction === 'asc' ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )
          ) : (
            <ChevronUpIcon className="w-4 h-4 opacity-30" />
          )}
        </div>
      </TableHead>
    );
  };

  const renderStatusBadge = (
    status: string,
    label: string,
    variant: 'default' | 'secondary' | 'outline'
  ) => {
    let Icon;
    switch (status) {
      case 'confirmed':
        Icon = ClockIcon;
        break;
      case 'active':
        Icon = CheckCircleIcon;
        break;
      case 'completed':
        Icon = CheckIcon;
        break;
      default:
        Icon = null;
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        <span>{label}</span>
      </Badge>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="px-2 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Contracts Management
            </h1>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <DocumentDownloadIcon className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToPDF}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleCreate} disabled={loading}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Contract
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-2 py-4 border-b bg-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by customer, passport, or car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="px-2 py-4">
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
                    {renderTableHeader('Customer', 'customer.name')}
                    {renderTableHeader('Passport', 'customer.passportNumber')}
                    {renderTableHeader('Car', 'car.model')}
                    {renderTableHeader('License Plate', 'car.licensePlate')}
                    {renderTableHeader('Start Date', 'startDate')}
                    {renderTableHeader('End Date', 'endDate')}
                    {renderTableHeader('Status', 'status')}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts.length > 0 ? (
                    paginatedContracts.map((contract, index) => {
                      const { status, label, variant } =
                        getContractStatus(contract);

                      return (
                        <TableRow key={contract.id || index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {contract.customer?.name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {contract.customer?.name || 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {contract.customer?.passportNumber || 'N/A'}
                          </TableCell>
                          <TableCell>{contract.car?.model || 'N/A'}</TableCell>
                          <TableCell>
                            {contract.car?.licensePlate || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {contract.startDate
                              ? new Date(
                                  contract.startDate
                                ).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {contract.endDate
                              ? new Date(contract.endDate).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(status, label, variant)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(contract)}
                                title="View Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleEdit(contract);
                                }}
                                title="Edit Contract"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleDownloadContract(contract);
                                }}
                                title="Download Contract"
                              >
                                <DocumentDownloadIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setShowDeleteDialog(true);
                                }}
                                title="Delete Contract"
                              >
                                <TrashIcon className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm || filterStatus !== 'all'
                          ? 'No contracts match your search criteria'
                          : 'No contracts available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredAndSortedContracts.length > 0 && (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Prikazuje se {(currentPage - 1) * itemsPerPage + 1} do{' '}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredAndSortedContracts.length
                    )}{' '}
                    od {filteredAndSortedContracts.length} rezultata
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Stavki po stranici:
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      <span className="ml-1">Prethodna</span>
                    </Button>

                    <span className="px-4 py-2 text-sm text-center">
                      Stranica {currentPage} od {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none"
                    >
                      <span className="mr-1">Sljedeća</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              contract.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* <AlertDialogAction onClick={() => handleDeleteContract()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractsPage;
