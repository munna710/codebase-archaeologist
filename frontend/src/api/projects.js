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