package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"encoding/json"
	"io/ioutil"

	"github.com/matthinc/corona-radius.de/cache"
	"github.com/matthinc/corona-radius.de/overpass"
)

type city struct {
	Name string
}

var redisCache = cache.NewCache(os.Getenv("REDIS_HOST"))

func main() {
	router := gin.Default()

	go downloadCityBoundaries()
	
	router.StaticFile("/", "./frontend/index.html")
	router.Static("/resources", "./frontend/resources")
	router.Static("/deps", "./frontend/deps")
	
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

func downloadCityBoundaries() {
	redisCache.FlushAll()

	var cities []city

	citiesFile, _ := ioutil.ReadFile("./germany.json")
	json.Unmarshal(citiesFile, &cities)

	for _, city := range cities {
		loadCityByName(city.Name)
	}
	
	loadCityByName("Emskirchen")
}

func loadCityByName(name string) {
	for _, element := range overpass.RequestBoundsByCityName(name) {
		elementJSON, _ := json.Marshal(element)

		if element.Tags.Wikipedia != "" {
			redisCache.LoadCity(element.Tags.Wikipedia, string(elementJSON))
		}
	}
}
