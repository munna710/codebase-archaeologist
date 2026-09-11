import apiClient from './client';

export const getDocumentation = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/documentation`);
  return response.data;
};

export const generateDocumentation = async (projectId) => {
  const response = await apiClient.post(`/projects/${projectId}/generate-documentation`);
  return response.data;
};