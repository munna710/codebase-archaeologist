import apiClient from './client';

export const getProjectDependencies = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/dependencies`);
  return response.data;
};