import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 100 }, // Simulate 100 users over 10s
    { duration: '30s', target: 100 }, // Hold 100 users for 30s
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

export default function () {
  const url = 'ws://localhost:8001/ws/dashboard';
  const params = { tags: { my_tag: 'stadiumiq' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', () => console.log('connected'));
    
    socket.on('message', (data) => {
      // Validate we receive proper JSON payloads
      const msg = JSON.parse(data);
      check(msg, { 'has timestamp': (o) => o.timestamp !== undefined });
    });

    socket.setTimeout(function () {
      socket.close();
    }, 45000);
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
