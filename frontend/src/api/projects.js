import apiClient from './client';

export const getAllProjects = async () => {
  const response = await apiClient.get('/projects');
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (repositoryUrl, description) => {
  const response = await apiClient.post('/projects', { repositoryUrl, description });
  return response.data;
};

export const analyzeProject = async (id) => {
  const response = await apiClient.post(`/projects/${id}/analyze`);
  return response.data;
};


export const createProjectFromZip = async (file, description) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  const response = await apiClient.post('/projects/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const reanalyzeProject = async (id) => {
  const response = await apiClient.post(`/projects/${id}/reanalyze`);
  return response.data;
};