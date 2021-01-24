package cache

import (
	"context"
	"fmt"
	
	"github.com/go-redis/redis/v8"
)

type Cache struct {
	db *redis.Client
	ctx context.Context
}

func NewCache(addr string) *Cache {
	db := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
	})

	return &Cache{ db: db, ctx: context.Background() }
}

func (c *Cache) GetCities() []string {
	cities, err := c.db.HKeys(c.ctx, "cities").Result()

	if err != nil {
		fmt.Println(err)
	}
	
	return cities
}

func (c *Cache) LoadCity(key string, boundary string) {
	c.db.HSet(c.ctx, "cities", key, boundary)
}

func (c *Cache) GetCity(key string) string {
	city, err := c.db.HGet(c.ctx, "cities", key).Result()

	if err != nil {
		fmt.Println(err)
	}
	
	return city
}

func (c *Cache) FlushAll() {
	c.db.FlushAll(c.ctx)
}
