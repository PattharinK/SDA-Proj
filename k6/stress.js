import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '30s', target: 300 },
        { duration: '1m', target: 0 },
    ],
};

export default function () {
    http.get('http://nginx/api/health');
    sleep(0.5);
}
