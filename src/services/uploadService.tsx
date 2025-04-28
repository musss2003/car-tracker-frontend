const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/uploads/';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      credentials: 'include', // include cookies if needed
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const data: { url: string } = await response.json();

    return data.url;
  } catch (error) {
    console.error('Error uploading image:', (error as Error).message);
    throw error;
  }
};
