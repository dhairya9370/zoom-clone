const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:2100/api/v1/users`;
    }
  }
  return 'http://localhost:2100/api/v1/users';
};

export const BASE_URL = getBaseUrl();
