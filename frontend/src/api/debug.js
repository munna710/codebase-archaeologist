import apiClient from './client';

export const analyzeError = async (projectId, stackTrace) => {
  const response = await apiClient.post(`/projects/${projectId}/debug`, { stackTrace });
  return response.data;
};