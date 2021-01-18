package main

import (
	"github.com/gin-gonic/gin"
	"path/filepath"
	"net/http"
	"os"
	"io/ioutil"

	"github.com/matthinc/corona-radius.de/cache"
)

var redisCache = cache.NewCache(os.Getenv("REDIS_HOST"))

func main() {
	router := gin.Default()

	loadCitiesFromFS()

	router.StaticFile("/", "./static/index.html")
	router.Static("/resources", "./static/resources")
	router.Static("/deps", "./static/deps")
	
	router.GET("/cities", getCities)
	router.GET("/city/:name", getCity)

	router.Run(":3000")
}

func getCities(c *gin.Context) {
	c.JSON(http.StatusOK, redisCache.GetCities())
}

func getCity(c *gin.Context) {
	c.Data(http.StatusOK, "application/json", []byte(redisCache.GetCity(c.Param("name"))))
}

func loadCitiesFromFS() {
	files, _ := filepath.Glob("./boundaries/*")
	for _, file := range(files) {
		content, _ := ioutil.ReadFile(file)
		redisCache.LoadCity(filepath.Base(file), string(content))
	}
}

