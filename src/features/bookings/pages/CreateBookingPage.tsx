import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { PageHeader } from '@/shared/components/ui/page-header';
import { LocationPicker } from '@/shared/components/ui/location-picker';
import { CustomerSearchSelect } from '@/features/customers/components/customer-search-select';
import { CarAvailabilitySelect } from '@/features/cars/components/car-availability-select';
import { DashboardLayout } from '@/shared/components/layout';
import { useCreateBooking, BOOKING_EXTRAS } from '../hooks/useCreateBooking';

const CreateBookingPage = () => {
  const { state, actions } = useCreateBooking();

  return (
    <DashboardLayout>
      <PageHeader
        title="Kreiraj Novu Rezervaciju"
        subtitle="Rezerviši automobil za kupca sa provjerom dostupnosti i izračunom cijene"
        onBack={actions.goBack}
      />

      <form onSubmit={actions.handleSubmit} className="mt-6 space-y-6">
        {/* Customer and Car Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customer">
                  Kupac <span className="text-red-500">*</span>
                </Label>
                <CustomerSearchSelect
                  value={state.customerId}
                  onChange={actions.handleCustomerChange}
                  customers={state.customers}
                  disabled={state.loadingCustomers}
                />
                {state.loadingCustomers && (
                  <p className="text-sm text-gray-500">Učitavanje kupaca...</p>
                )}
                {state.errors.customerId && (
                  <p className="text-sm text-red-500">
                    {state.errors.customerId}
                  </p>
                )}
              </div>

              {/* Car Selection */}
              <div className="space-y-2">
                <CarAvailabilitySelect
                  value={state.carId}
                  onChange={actions.handleCarChange}
                  startDate={state.startDate}
                  endDate={state.endDate}
                  required
                  onCarsLoaded={actions.handleCarsLoaded}
                  onPriceCalculated={actions.handlePriceCalculated}
                  error={state.errors.carId}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Datum Početka <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={state.startDate}
                  onChange={(e) =>
                    actions.handleStartDateChange(e.target.value)
                  }
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {state.errors.startDate && (
                  <p className="text-sm text-red-500">
                    {state.errors.startDate}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Datum Završetka <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={state.endDate}
                  onChange={(e) => actions.handleEndDateChange(e.target.value)}
                  min={
                    state.startDate || new Date().toISOString().split('T')[0]
                  }
                  required
                />
                {state.errors.endDate && (
                  <p className="text-sm text-red-500">{state.errors.endDate}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-6">Lokacije</h3>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Pickup Location */}
              <div className="max-w-2xl">
                <LocationPicker
                  label="Lokacija Preuzimanja"
                  placeholder="Pretraži adresu..."
                  notesPlaceholder="npr. Glavni Ured - Kod recepcije"
                  value={state.pickupLocation}
                  onChange={actions.setPickupLocation}
                />
              </div>

              {/* Dropoff Location */}
              <div className="max-w-2xl">
                <LocationPicker
                  label="Lokacija Vraćanja"
                  placeholder="Pretraži adresu..."
                  notesPlaceholder="npr. Aerodromski Terminal 1 - Parking B"
                  value={state.dropoffLocation}
                  onChange={actions.setDropoffLocation}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extras */}
        <Card>
          <CardContent className="pt-6">
            <Label className="text-lg font-semibold mb-4 block">
              Dodatni Dodaci
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              {BOOKING_EXTRAS.map((extra) => (
                <div
                  key={extra.type}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={extra.type}
                      checked={state.extrasQuantities[extra.type] > 0}
                      onCheckedChange={(checked) =>
                        actions.handleExtraToggle(extra.type, checked === true)
                      }
                    />
                    <div>
                      <Label
                        htmlFor={extra.type}
                        className="font-medium cursor-pointer"
                      >
                        {extra.label}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {extra.pricePerDay} KM/dan
                      </p>
                    </div>
                  </div>

                  {state.extrasQuantities[extra.type] > 0 && (
                    <Input
                      type="number"
                      min="1"
                      value={state.extrasQuantities[extra.type]}
                      onChange={(e) =>
                        actions.handleExtraQuantityChange(
                          extra.type,
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="w-20"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Napomene</Label>
              <Textarea
                id="notes"
                placeholder="Dodajte posebne zahtjeve ili napomene..."
                value={state.notes}
                onChange={(e) => actions.setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        {state.totalCost > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Pregled Troškova</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period Iznajmljivanja:</span>
                  <span className="font-medium">
                    {state.totalDays} {state.totalDays === 1 ? 'dan' : 'dana'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Iznajmljivanje Automobila:
                  </span>
                  <span className="font-medium">
                    {state.carCost.toFixed(2)} KM
                  </span>
                </div>
                {state.extrasCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dodaci:</span>
                    <span className="font-medium">
                      {state.extrasCost.toFixed(2)} KM
                    </span>
                  </div>
                )}
                <div className="border-t border-blue-300 pt-3 flex justify-between">
                  <span className="font-semibold text-lg">Ukupna Cijena:</span>
                  <span className="font-bold text-lg text-blue-600">
                    {state.totalCost.toFixed(2)} KM
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Potreban Depozit (20%):</span>
                  <span className="font-medium text-orange-600">
                    {state.depositAmount.toFixed(2)} KM
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={actions.cancelBooking}
            disabled={state.loading}
          >
            Otkaži
          </Button>
          <Button type="submit" disabled={state.loading}>
            {state.loading ? 'Kreiranje...' : 'Kreiraj Rezervaciju'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CreateBookingPage;
