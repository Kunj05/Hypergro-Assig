import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => console.error('❌ Redis Error:', err));

redisClient.connect().then(() => {
  console.log('✅ Redis connected');
});

export default redisClient;
