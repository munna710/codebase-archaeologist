import apiClient from './client';

export const getCommits = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/commits`);
  return response.data;
};

export const explainCommit = async (projectId, commitId) => {
  const response = await apiClient.post(`/projects/${projectId}/commits/${commitId}/explain`);
  return response.data;
};
