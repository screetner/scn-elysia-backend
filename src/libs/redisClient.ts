import Redis from 'ioredis'
import * as process from 'node:process'

class RedisSingleton {
  private static instance: Redis

  public static getInstance(): Redis {
    if (!RedisSingleton.instance) {
      // Initialize the Redis client only once
      RedisSingleton.instance = new Redis(process.env.REDIS_URL!)
    }
    return RedisSingleton.instance
  }
}

export const redisClient = RedisSingleton.getInstance()
