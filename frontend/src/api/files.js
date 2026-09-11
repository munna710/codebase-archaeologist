import apiClient from './client';

export const getProjectFiles = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/files`);
  return response.data;
};