import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CarDetails from '../../components/Car/CarDetails/CarDetails';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getCars } from '../../services/carService';
import { getActiveContracts } from '../../services/contractService';
import { Car } from '../../types/Car';
import { Contract } from '../../types/Contract';

const CarDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const fetchCarAndContracts = async () => {
      try {
        setLoading(true);
        const [cars, activeContracts] = await Promise.all([
          getCars(),
          getActiveContracts()
        ]);
        
        const foundCar = cars.find((c: Car) => c.id === id);
        
        if (!foundCar) {
          setError('Car not found');
          toast.error('Car not found');
          navigate('/cars');
          return;
        }
        
        // Check if car is busy (has active contract)
        const busyCarLicensePlates = new Set(
          activeContracts.map((contract: Contract) => contract.car.licensePlate)
        );
        setIsBusy(busyCarLicensePlates.has(foundCar.licensePlate));
        
        setCar(foundCar);
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Failed to load car');
        toast.error('Failed to load car');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarAndContracts();
    }
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/cars/${id}/edit`);
  };

  const handleClose = () => {
    navigate('/cars');
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'Car not found'}</p>
          <button onClick={() => navigate('/cars')}>Back to Cars</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <CarDetails 
        car={car} 
        isBusy={isBusy} 
        onEdit={handleEdit} 
        onClose={handleClose} 
      />
    </div>
  );
};

export default CarDetailsPage;
