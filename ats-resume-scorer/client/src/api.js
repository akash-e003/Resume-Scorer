import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const analyzeResume = async (resumeFile, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export default api;
