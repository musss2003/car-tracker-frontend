import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CreateCarForm from '../../components/Car/CreateCarForm/CreateCarForm';
import { addCar } from '../../services/carService';
import { Car } from '../../types/Car';

const CreateCarPage = () => {
  const navigate = useNavigate();

  const handleSave = async (car: Car) => {
    try {
      await addCar(car);
      toast.success('Car created successfully!');
      navigate('/cars');
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('Failed to create car');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/cars');
  };

  return (
    <div className="page-container">
      <CreateCarForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default CreateCarPage;
