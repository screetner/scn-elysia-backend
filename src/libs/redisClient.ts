import Redis from 'ioredis'

class RedisSingleton {
  private static instance: Redis

  public static getInstance(): Redis {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new Redis(process.env.REDIS_URL || '')
    }
    return RedisSingleton.instance
  }
}

export const redisClient = RedisSingleton.getInstance()
