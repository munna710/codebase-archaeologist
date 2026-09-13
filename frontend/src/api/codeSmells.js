import apiClient from './client';

export const getCodeSmells = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/code-smells`);
  return response.data;
};