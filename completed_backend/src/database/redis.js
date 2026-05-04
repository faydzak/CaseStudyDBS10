const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected on 127.0.0.1:6379');
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
