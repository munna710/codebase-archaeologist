import apiClient from './client';

export const getClassDetails = async (projectId, classId) => {
  const response = await apiClient.get(`/projects/${projectId}/classes/${classId}`);
  return response.data;
};

export const getClassRanking = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/classes/ranking`);
  return response.data;
};


export const getComplexityRanking = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/classes/complexity`);
  return response.data;
};


