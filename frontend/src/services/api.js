import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Backend URL
    withCredentials: true, // สำคัญมาก! ต้องเปิดเพื่อให้ Browser ส่ง Cookie ไปหา Server
});

export default api;