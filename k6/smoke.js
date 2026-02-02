import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 1,
    iterations: 10,
};

export default function () {
    const res = http.get('http://nginx/api/health');

    check(res, {
        'status is 200': r => r.status === 200,
        'response < 500ms': r => r.timings.duration < 500,
    });

    sleep(1);
}
