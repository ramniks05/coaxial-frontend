/**
 * YouTube Utility Functions
 * Handles YouTube URL validation, ID extraction, and metadata
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Remove any whitespace and quotes
  url = url.trim().replace(/^["']|["']$/g, '');
  
  // YouTube URL patterns
  const patterns = [
    // Standard watch URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"&?\/\s]{11})/,
    // Short URLs
    /youtu\.be\/([^"&?\/\s]{11})/,
    // Embed URLs
    /youtube\.com\/embed\/([^"&?\/\s]{11})/,
    // Mobile URLs
    /youtube\.com\/v\/([^"&?\/\s]{11})/,
    // Live URLs
    /youtube\.com\/live\/([^"&?\/\s]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Validate if a URL is a valid YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  return getYouTubeVideoId(url) !== null;
};

/**
 * Generate YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, medium, high, maxres)
 * @returns {string} - Thumbnail URL
 */
export const getYouTubeThumbnail = (videoId, quality = 'maxres') => {
  if (!videoId) return null;
  
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };
  
  const qualityKey = qualityMap[quality] || 'maxresdefault';
  return `https://img.youtube.com/vi/${videoId}/${qualityKey}.jpg`;
};

/**
 * Generate YouTube embed URL
 * @param {string} videoId - YouTube video ID
 * @param {object} options - Embed options
 * @returns {string} - Embed URL
 */
export const getYouTubeEmbedUrl = (videoId, options = {}) => {
  if (!videoId) return null;
  
  const defaultOptions = {
    autoplay: 0,
    controls: 1,
    showinfo: 1,
    rel: 0,
    modestbranding: 1,
    ...options
  };
  
  const params = new URLSearchParams(defaultOptions);
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Generate YouTube watch URL
 * @param {string} videoId - YouTube video ID
 * @returns {string} - Watch URL
 */
export const getYouTubeWatchUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Normalize YouTube URL to standard format
 * @param {string} url - YouTube URL
 * @returns {string|null} - Normalized URL or null if invalid
 */
export const normalizeYouTubeUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return getYouTubeWatchUrl(videoId);
};

/**
 * Get video metadata (title, duration) from YouTube
 * Note: This requires YouTube Data API v3
 * @param {string} videoId - YouTube video ID
 * @param {string} apiKey - YouTube API key
 * @returns {Promise<object>} - Video metadata
 */
export const getYouTubeVideoMetadata = async (videoId, apiKey) => {
  if (!videoId || !apiKey) return null;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
    );
    
    if (!response.ok) throw new Error('Failed to fetch video metadata');
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        title: video.snippet.title,
        description: video.snippet.description,
        duration: video.contentDetails.duration,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching YouTube video metadata:', error);
    return null;
  }
};

/**
 * Format duration from YouTube API format (PT4M13S) to readable format (4:13)
 * @param {string} duration - YouTube duration format
 * @returns {string} - Formatted duration
 */
export const formatYouTubeDuration = (duration) => {
  if (!duration) return 'Unknown';
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'Unknown';
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Validate and process YouTube URL for form input
 * @param {string} url - YouTube URL
 * @returns {object} - Validation result with processed data
 */
export const processYouTubeUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) {
    return {
      isValid: false,
      error: 'Invalid YouTube URL format',
      videoId: null,
      normalizedUrl: null,
      thumbnail: null
    };
  }
  
  return {
    isValid: true,
    error: null,
    videoId,
    normalizedUrl: normalizeYouTubeUrl(url),
    thumbnail: getYouTubeThumbnail(videoId),
    embedUrl: getYouTubeEmbedUrl(videoId)
  };
};
