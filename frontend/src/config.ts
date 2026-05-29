// Dynamically resolve the backend host so the app works from any device on the network
const BACKEND_HOST = window.location.hostname;
const BACKEND_PORT = 5001;

export const config = {
  API_URL: `http://${BACKEND_HOST}:${BACKEND_PORT}/api`,
  SOCKET_URL: `http://${BACKEND_HOST}:${BACKEND_PORT}`,
};
