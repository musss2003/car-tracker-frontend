import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditCarForm from '../../components/Car/EditCarForm/EditCarForm';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getCars, updateCar } from '../../services/carService';
import { Car } from '../../types/Car';

const EditCarPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const cars = await getCars();
        const foundCar = cars.find((c: Car) => c.id === id);
        
        if (!foundCar) {
          setError('Car not found');
          toast.error('Car not found');
          navigate('/cars');
          return;
        }
        
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
      fetchCar();
    }
  }, [id, navigate]);

  const handleSave = async (updatedCar: Car) => {
    try {
      await updateCar(updatedCar.id, updatedCar);
      toast.success('Car updated successfully!');
      navigate('/cars');
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Failed to update car');
      throw error;
    }
  };

  const handleCancel = () => {
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
      <EditCarForm car={car} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default EditCarPage;
