import apiClient from './client';

export const getDocumentation = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/documentation`);
  return response.data;
};

export const generateDocumentation = async (projectId) => {
  const response = await apiClient.post(`/projects/${projectId}/generate-documentation`);
  return response.data;
};

export const downloadMarkdown = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/export/markdown`, {
    responseType: 'blob',
  });
  triggerDownload(response.data, 'documentation.md');
};

export const downloadPdf = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/export/pdf`, {
    responseType: 'blob',
  });
  triggerDownload(response.data, 'documentation.pdf');
};

function triggerDownload(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}