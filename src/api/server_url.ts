
const server_url = (
  import.meta.env.VITE_APP_API_URL ||
  'http://localhost:5000'
).replace(/\/+$/, '');

export default server_url;
