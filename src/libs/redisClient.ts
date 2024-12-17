import { Redis } from '@upstash/redis'

class RedisSingleton {
  private static instance: Redis

  public static getInstance(): Redis {
    if (!RedisSingleton.instance) {
      // Initialize the Redis client only once
      RedisSingleton.instance = new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN,
      })
    }
    return RedisSingleton.instance
  }
}

export const redisClient = RedisSingleton.getInstance()
