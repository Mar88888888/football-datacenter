import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '20s', target: 50 }, 
        { duration: '20s', target: 100 },
        { duration: '20s', target: 50 }, 
        { duration: '20s', target: 0 }, 
    ],
};

export default function () {
    let res = http.get('http://localhost:3000/fdc-api/user');

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 2s': (r) => r.timings.duration < 1000, 
    });

    sleep(1); 
}
