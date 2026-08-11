export const server = import.meta.env.PROD
  ? "https://zoom-clone-backend-bp2t.onrender.com"
  : "http://localhost:2100";

export default server;