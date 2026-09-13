import apiClient from './client';

export const askQuestion = async (projectId, question) => {
  const response = await apiClient.post(`/projects/${projectId}/chat`, { question });
  return response.data;
};