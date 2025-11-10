import { useEffect, useState, useMemo } from 'react';
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import Skeleton from '@/shared/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { useNavigate } from 'react-router-dom';
import {
  deleteContract,
  downloadContract,
  getContracts,
} from '../services/contractService';
import { Contract } from '../types/contract.types';

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
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );

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
            aValue = a.customer[prop as keyof typeof a.customer] ?? '';
            bValue = b.customer[prop as keyof typeof b.customer] ?? '';
          } else if (obj === 'car' && a.car && b.car) {
            aValue = a.car[prop as keyof typeof a.car] ?? '';
            bValue = b.car[prop as keyof typeof b.car] ?? '';
          } else if (prop === 'startDate' || prop === 'endDate') {
            const aDate = a[prop];
            const bDate = b[prop];
            aValue = new Date(aDate instanceof Date ? aDate : aDate || '');
            bValue = new Date(bDate instanceof Date ? bDate : bDate || '');
          }
        } else {
          const key = sortConfig.key as keyof Contract;
          const aVal = a[key];
          const bVal = b[key];
          aValue =
            typeof aVal === 'string' ||
            typeof aVal === 'number' ||
            aVal instanceof Date
              ? aVal
              : '';
          bValue =
            typeof bVal === 'string' ||
            typeof bVal === 'number' ||
            bVal instanceof Date
              ? bVal
              : '';
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
        toast.success('Ugovor uspješno obrisan');
        setShowDeleteDialog(false);
        setContractToDelete(null);
      } else {
        toast.error('ID ugovora nije pronađen.');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Brisanje ugovora nije uspjelo');
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
        toast.success('Preuzimanje ugovora započeto');
      } else {
        toast.error('ID ugovora nije pronađen.');
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast.error('Preuzimanje ugovora nije uspjelo');
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

      doc.save('ugovori.pdf');
      toast.success('PDF uspješno izvezen');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Izvoz PDF-a nije uspio');
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
      XLSX.writeFile(workbook, 'ugovori.xlsx');
      toast.success('Excel uspješno izvezen');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Izvoz Excel-a nije uspio');
    }
  };

  // Helper function to determine contract status - memoized to avoid recalculation
  const getContractStatus = useMemo(
    () => (contract: Contract) => {
      const now = new Date();
      const startDate = new Date(contract.startDate);
      const endDate = new Date(contract.endDate);

      if (now < startDate)
        return {
          status: 'confirmed',
          label: 'Potvrđen',
          variant: 'secondary' as const,
        };
      else if (now >= startDate && now <= endDate)
        return {
          status: 'active',
          label: 'Aktivan',
          variant: 'default' as const,
        };
      else
        return {
          status: 'completed',
          label: 'Završen',
          variant: 'outline' as const,
        };
    },
    []
  );

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
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Upravljanje ugovorima
            </h1>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <DocumentDownloadIcon className="w-4 h-4 mr-2" />
                    Izvoz
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToPDF}>
                    Izvezi kao PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel}>
                    Izvezi kao Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleCreate} disabled={loading}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Kreiraj ugovor
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
              placeholder="Pretraži po imenu kupca, broju pasoša ili vozilu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtriraj po statusu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="confirmed">Potvrđeni</SelectItem>
                <SelectItem value="active">Aktivni</SelectItem>
                <SelectItem value="completed">Završeni</SelectItem>
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
                    <TableHead
                      className="hidden min-[1300px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('customer.name')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Kupac</span>
                        {sortConfig.key === 'customer.name' ? (
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
                    <TableHead
                      className="hidden min-[1050px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('customer.passportNumber')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Pasoš</span>
                        {sortConfig.key === 'customer.passportNumber' ? (
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
                    {renderTableHeader('Automobil', 'car.model')}
                    <TableHead
                      className="max-md:table-cell hidden min-[1400px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('car.licensePlate')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Registarska tablica</span>
                        {sortConfig.key === 'car.licensePlate' ? (
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
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('startDate')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Datum početka</span>
                        {sortConfig.key === 'startDate' ? (
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
                    <TableHead
                      className="hidden min-[900px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('endDate')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Datum završetka</span>
                        {sortConfig.key === 'endDate' ? (
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
                    <TableHead
                      className="hidden min-[1150px]:table-cell cursor-pointer select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Status</span>
                        {sortConfig.key === 'status' ? (
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
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts.length > 0 ? (
                    paginatedContracts.map((contract, index) => {
                      const { status, label, variant } =
                        getContractStatus(contract);

                      return (
                        <TableRow key={contract.id || index}>
                          <TableCell className="hidden min-[1300px]:table-cell">
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
                          <TableCell className="hidden min-[1050px]:table-cell">
                            {contract.customer?.passportNumber || 'N/A'}
                          </TableCell>
                          <TableCell>{contract.car?.model || 'N/A'}</TableCell>
                          <TableCell className="max-md:table-cell hidden min-[1400px]:table-cell">
                            {contract.car?.licensePlate || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {contract.startDate
                              ? new Date(
                                  contract.startDate
                                ).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="hidden min-[900px]:table-cell">
                            {contract.endDate
                              ? new Date(contract.endDate).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="hidden min-[1150px]:table-cell">
                            {renderStatusBadge(status, label, variant)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(contract)}
                                title="Pogledaj detalje"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleEdit(contract);
                                }}
                                title="Uredi ugovor"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleDownloadContract(contract);
                                }}
                                title="Preuzmi ugovor"
                              >
                                <DocumentDownloadIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setContractToDelete(contract);
                                  setShowDeleteDialog(true);
                                }}
                                title="Obriši ugovor"
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
                          ? 'Nema ugovora koji odgovaraju vašim kriterijima pretrage'
                          : 'Nema dostupnih ugovora'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Prikazujem {paginatedContracts.length} od{' '}
                {filteredAndSortedContracts.length} ugovora
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 / stranica</SelectItem>
                    <SelectItem value="10">10 / stranica</SelectItem>
                    <SelectItem value="20">20 / stranica</SelectItem>
                    <SelectItem value="50">50 / stranica</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Prethodna
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sljedeća
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Stranica {currentPage} od {totalPages}
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
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija se ne može poništiti. Ovo će trajno obrisati ugovor
              {contractToDelete && (
                <span className="font-medium">
                  {' '}
                  za {contractToDelete.customer?.name} koji je iznajmio (
                  {contractToDelete.car?.manufacturer}) (
                  {contractToDelete.car?.model}) u periodu od{' '}
                  {new Date(contractToDelete.startDate).toLocaleDateString()} do{' '}
                  {new Date(contractToDelete.endDate).toLocaleDateString()}
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setContractToDelete(null);
              }}
            >
              Otkaži
            </AlertDialogCancel>
            <Button
              variant="destructive"
              className="bg-red-500 text-white"
              onClick={() => {
                if (contractToDelete) {
                  handleDeleteContract(contractToDelete);
                }
              }}
              disabled={!contractToDelete}
            >
              Obriši
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractsPage;
