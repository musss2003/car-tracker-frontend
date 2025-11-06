import { useEffect, useRef, useState } from 'react';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { Customer } from '../types/customer.types';

interface CustomerSearchSelectProps {
  value: string;
  onChange: (customerId: string) => void;
  customers: Customer[];
  disabled?: boolean;
}

export function CustomerSearchSelect({
  value,
  onChange,
  customers,
  disabled = false,
}: CustomerSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCustomer = customers.find((c) => c.id === value);
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (customerId: string) => {
    onChange(customerId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={!value ? 'text-muted-foreground' : ''}>
          {selectedCustomer?.name || 'Select a customer'}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border-2 border-border shadow-2xl"
          style={{ backgroundColor: 'hsl(var(--card))', opacity: 1 }}
        >
          <div
            className="p-2 border-b-2 border-border"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 border-2 border-border rounded-md"
              style={{ backgroundColor: 'hsl(var(--muted))' }}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm text-foreground placeholder:text-muted-foreground"
                style={{ backgroundColor: 'transparent' }}
                autoFocus
              />
            </div>
          </div>
          <div
            className="max-h-[300px] overflow-y-auto p-1"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          >
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelect(customer.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
              >
                <span>{customer.name}</span>
                {value === customer.id && <Check className="h-4 w-4" />}
              </button>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No customers found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
