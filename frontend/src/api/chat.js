import apiClient from './client';

export const askQuestion = async (projectId, question, history) => {
  const response = await apiClient.post(`/projects/${projectId}/chat`, { question, history });
  return response.data;
};