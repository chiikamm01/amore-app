/**
 * API service for communicating with the backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Convert blob URL to File object for upload
 * @param {string} blobUrl - The blob URL from captured video
 * @returns {Promise<File>} File object ready for upload
 */
async function blobUrlToFile(blobUrl) {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const filename = `video-${Date.now()}.webm`;
  return new File([blob], filename, { type: blob.type || 'video/webm' });
}

/**
 * Upload video and get complete analysis result
 * @param {string} videoBlobUrl - Blob URL of the captured video
 * @returns {Promise<Object>} Analysis result matching AnalysisResponse model
 */
export async function uploadVideoAndAnalyze(videoBlobUrl) {
  try {
    // Convert blob URL to File object
    const videoFile = await blobUrlToFile(videoBlobUrl);

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('video', videoFile);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading video for analysis:', error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(
        'Backend not reachable. Start the backend: cd backend && uvicorn main:app --reload'
      );
    }
    throw error;
  }
}

/**
 * Check API health status
 * @returns {Promise<Object>} Health check response
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
}
