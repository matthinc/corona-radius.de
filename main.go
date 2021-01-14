package main

import (
	"github.com/gin-gonic/gin"
	"path/filepath"
	"net/http"
)

func main() {
	router := gin.Default()

	router.StaticFile("/", "./static/index.html")
	router.Static("/resources", "./static/resources")
	router.Static("/deps", "./static/deps")
	
	router.GET("/cities", getCities)
	router.GET("/city/:name", getCity)

	router.Run(":3000")
}

func getCities(c *gin.Context) {
	filenames, err := getCitiesFromFS()

	if err == nil {
		c.JSON(http.StatusOK, filenames)
	} else {
		c.Status(http.StatusInternalServerError)
	}
}

func getCity(c *gin.Context) {
	filenames, err := getCitiesFromFS()
	cityName := c.Param("name")

	if err != nil {
		c.Status(http.StatusInternalServerError)
	}

	for _, filename := range filenames {
		if filename == cityName {
			c.File("./boundaries/" + filename)
		}
	}

	c.Status(http.StatusNotFound)
}

func getCitiesFromFS() ([]string, error) {
	files, err := filepath.Glob("./boundaries/*")

	if err != nil {
		return nil, err
	}

	filenames := make([]string, len(files))

	for i, fn := range files {
		filenames[i] = filepath.Base(fn)
	}

	return filenames, nil
}

