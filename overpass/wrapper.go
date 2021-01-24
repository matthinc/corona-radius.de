package overpass

import (
	"net/http"
	"io/ioutil"
	"net/url"
	"encoding/json"
)

type OverpassResponse struct {
	Elements []OverpassElement
}

type OverpassElement struct {
	Id int
	Bounds OverpassBounds
	Tags OverpassTags
	Members []OverpassMember
}

type OverpassBounds struct {
	Minlat float64
	Minlon float64
	Maxlat float64
	Maxlon float64
}

type OverpassTags struct {
	Name string
	Wikipedia string
}

type OverpassMember struct {
	Type string
	Geometry []OverpassPoint
}

type OverpassPoint struct {
	Lat float64
	Lon float64
}

func RequestBoundsByCityName(name string) []OverpassElement {
	request := `[out:json];relation[name="` + name + `"][type="boundary"][boundary="administrative"];out geom;`
	
	resp, err := http.Get("https://overpass-api.de/api/interpreter?data=" + url.QueryEscape(request))

	if err == nil {
		body, _ := ioutil.ReadAll(resp.Body)

		var data OverpassResponse
		json.Unmarshal(body, &data)

		return data.Elements
	}

	return nil
}
