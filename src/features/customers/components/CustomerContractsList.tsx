import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import {
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from '@heroicons/react/solid';
import Skeleton from '@/shared/components/ui/skeleton';
import { Contract } from '@/features/contracts/types/contract.types';
import { getCustomerContracts } from '../services/customerService';
import { format } from 'date-fns';

interface CustomerContractsListProps {
  customerId: string;
  customerName: string;
}

type SortKey = 'startDate' | 'endDate' | 'totalAmount' | 'car';
type SortDirection = 'asc' | 'desc';

const CustomerContractsList: React.FC<CustomerContractsListProps> = ({
  customerId,
  customerName,
}) => {
  const navigate = useNavigate();

  // State management
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering and sorting
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: 'startDate',
    direction: 'desc',
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  // Fetch customer contracts
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await getCustomerContracts(customerId);
      setContracts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch customer contracts:', err);
      setError('Greška pri učitavanju ugovora');
      toast.error('Greška pri učitavanju ugovora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [customerId]);

  // Determine contract status
  const getContractStatus = (contract: Contract): 'active' | 'upcoming' | 'completed' | 'expired' => {
    const now = new Date();
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'completed';
    return 'expired';
  };

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    let filtered = [...contracts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (contract) =>
          contract.car.manufacturer
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contract.car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.car.licensePlate
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (contract) => getContractStatus(contract) === statusFilter
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'car':
          aValue = `${a.car.manufacturer} ${a.car.model}`;
          bValue = `${b.car.manufacturer} ${b.car.model}`;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [contracts, searchTerm, sortConfig, statusFilter]);

  // Pagination
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

  // Sorting toggle
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Navigation
  const handleViewContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  const handleCreateContract = () => {
    navigate(`/contracts/new?customerId=${customerId}`);
  };

  // Get status badge
  const getStatusBadge = (status: 'active' | 'upcoming' | 'completed' | 'expired') => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
    };

    const labels = {
      active: 'Aktivan',
      upcoming: 'Nadolazeći',
      completed: 'Završen',
      expired: 'Istekao',
    };

    return (
      <Badge className={styles[status]} variant="outline">
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
            Povijest Ugovora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
            Povijest Ugovora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchContracts} variant="outline" size="sm">
              Pokušaj ponovo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
            Povijest Ugovora
            <Badge variant="outline" className="ml-2">
              {contracts.length}
            </Badge>
          </CardTitle>
          <Button
            onClick={handleCreateContract}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Novi Ugovor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nema ugovora
            </h3>
            <p className="text-gray-500 mb-6">
              {customerName} još nema registrovanih ugovora
            </p>
            <Button
              onClick={handleCreateContract}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Kreiraj Prvi Ugovor
            </Button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Pretraži automobile
                </label>
                <Input
                  placeholder="Model, proizvođač ili tablica..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Svi statusi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi statusi</SelectItem>
                    <SelectItem value="active">Aktivan</SelectItem>
                    <SelectItem value="upcoming">Nadolazeći</SelectItem>
                    <SelectItem value="completed">Završen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('car')}
                    >
                      <div className="flex items-center gap-1">
                        <TruckIcon className="w-4 h-4" />
                        Automobil
                        {sortConfig.key === 'car' && (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('startDate')}
                    >
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        Period Najma
                        {sortConfig.key === 'startDate' && (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalAmount')}
                    >
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Ukupna Cijena
                        {sortConfig.key === 'totalAmount' && (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts.map((contract) => {
                    const status = getContractStatus(contract);
                    return (
                      <TableRow key={contract.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {contract.car.manufacturer} {contract.car.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contract.car.licensePlate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(contract.startDate), 'dd.MM.yyyy')}
                            </div>
                            <div className="text-gray-500">
                              do {format(new Date(contract.endDate), 'dd.MM.yyyy')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-gray-900">
                            {contract.totalAmount.toLocaleString('bs-BA', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            KM
                          </div>
                          <div className="text-xs text-gray-500">
                            {contract.dailyRate.toLocaleString('bs-BA', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            KM/dan
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleViewContract(contract.id)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Pogledaj
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Prikazano {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAndSortedContracts.length
                  )}{' '}
                  od {filteredAndSortedContracts.length} ugovora
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Prethodna
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Sljedeća
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerContractsList;
