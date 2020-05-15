import React from 'react';

import MapGL from '@urbica/react-map-gl';
import Draw from '@urbica/react-map-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import './App.css';

export default class Register extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      "name": "",
      "email": "",
      "password": "",
      "password_verify": "",
      "geo_region": "",
      "mornPickup": false,
      "aftPickup": false,
      "evePickup": false,
      "stops_limit": "",
      "header":"",
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.newRegion = this.newRegion.bind(this)
    this.validateInput = this.validateInput.bind(this)
    this.handleNewRegistration = this.handleNewRegistration.bind(this)
  }

  handleInputChange(event) {
    const target = event.target;
    let value;
    if (target.type === 'checkbox') {
      value = target.checked;
    } else {
      value = target.value;
    }
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  newRegion(features) {
    this.setState({ geo_region: features })
    if (this.state.geo_region !== "" && this.state.geo_region.features !== "") {
      console.log(this.state.geo_region.features[0].geometry)
    }
  }

  validateInput() {
    let alerts = []
    if (this.state.email)
      if (this.state.password.length < 6) {
        alerts.push("Password too short (min. 6 characters)")
      }
    if (this.state.password !== this.state.password_verify) {
      alerts.push("Passwords do not match")
    }
    if (this.state.geo_region === "" && this.state.geo_region.features === "") {
      alerts.push("Please draw a collection region")
    }
    if (this.state.mornPickup === false && this.state.aftPickup === false && this.state.evePickup === false) {
      alerts.push("Please select a pickup timeslot")
    }

    if (alerts.length > 0) {
      let alertString = ""
      alerts.map(i => alertString = alertString + i + ", ")
      alert(alertString)
      return false
    } else {
      return true
    }
  }

  handleNewRegistration(event) {
    if (this.validateInput() === true) {

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var signupData = JSON.stringify({
        "details": {
          "name": this.state.name,
          "email": this.state.email,
          "password": this.state.password,
          "geo_region": this.state.geo_region.features[0].geometry,
          "pickup_times": [this.state.mornPickup, this.state.aftPickup, this.state.evePickup],
          "header": this.state.header,
          // "stops_limit":this.state.stops_limit,
        },
      })

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: signupData,
        redirect: 'follow',
      };

      fetch("/api/auth/register", requestOptions)
        .then(response => {
          if (response.status === 200) {
            window.location.replace(response.url)
          } else {
            throw new Error()
          }
        })
        .catch(error => console.log('error', error));
    }
    event.preventDefault();
  }

  componentDidMount() {
    fetch("/api/auth/login")
      .then(response => response.json())
      .then(result => result && window.location.replace("/list"))
      .catch(error => console.log(error))
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Create your own bottle drive</h1>
        </header>
        <div>
          <form onSubmit={this.handleNewRegistration}>
            <label>
              {/* Your name: */}
                <input name="name" type="text" placeholder="Your name"value={this.state.name} onChange={this.handleInputChange} required />
            </label>
            <br />
            <br />
            <label>
              {/* email: */}
                    <input name="email" type="email" placeholder="Your email" value={this.state.email} onChange={this.handleInputChange} required />
            </label>
            <br />
            <br />
            <label>
              {/* create password: */}
                    <input name="password" type="password" placeholder="Password" value={this.state.password} onChange={this.handleInputChange} required />
            </label>
            <br />
            <label>
              {/* verify password: */}
                    <input name="password_verify" type="password" placeholder="Verify password" value={this.state.password_verify} onChange={this.handleInputChange} required />
            </label>
            <br />
            <br />
            <label>
              Pickup region:
            </label>
            <br />
            <Map newRegion={this.newRegion} width="100%" height="400px" />
            <br />
            <label>Pick your collection Times:</label>
            <br />
            <label>
              <input type="checkbox" name="mornPickup" checked={this.state.mornPickup} onChange={this.handleInputChange} />
                    Morning (7:00-11:59)
                  </label>
            <br />
            <label>
              <input type="checkbox" name="aftPickup" checked={this.state.aftPickup} onChange={this.handleInputChange} />
                    Afternoon (12:00-16:59)
                  </label>
            <br />
            <label>
              <input type="checkbox" name="evePickup" checked={this.state.evePickup} onChange={this.handleInputChange} />
                    Evening (17:00-20:00)
                  </label>
            <br />
            <br />
            <label>
              Your header message (optional):
                <input name="header" type="text" value={this.state.header} onChange={this.handleInputChange} placeholder={`ex."All proceeds go to..."`} />
            </label>
            <br />
            <br />
            <input type="submit" value="Sign up" />
            <br />
            <br />
          </form>
        </div>
      </div>
    )
  }
}

class Map extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      polygon: false,
      features: [],
      mode: 'simple_select',
      viewport: {
        width: '100%',
        height: 400,
        latitude: 43.6532,
        longitude: -79.3832,
        zoom: 2
      }
    }
  }

  componentDidMount() {
    fetch("https://ipapi.co/json")
      .then(response => response.json())
      .then(result => this.setState({ viewport: { latitude: result.latitude, longitude: result.longitude, zoom: 11 } }))
      .catch(error => console.log('error', error));
  }

  render() {
    return (
      <div>
        <MapGL
          style={{ width: this.props.width, height: this.props.height }}
          onViewportChange={(viewport) => this.setState({ viewport })}
          mapStyle={mapStyle}
          {...this.state.viewport}
        >
          <Draw
            mode={this.state.mode}
            onDrawModeChange={({ mode }) => {
              if (mode === "simple_select" || mode === "draw_polygon") {
                this.setState({ mode })
              }
            }}
            onDrawCreate={({ features }) => {
              this.setState({ features })
              this.setState({ polygon: true })
              this.props.newRegion({ features })
            }}
            onDrawUpdate={({ features }) => {
              this.setState({ features })
              this.props.newRegion({ features })
            }}
            onDrawDelete={({ features }) => {
              this.setState({ features })
              this.setState({ polygon: false })
              this.props.newRegion({ features: "" })
            }}
            pointControl={false}
            uncombineFeaturesControl={false}
            combineFeaturesControl={false}
            lineStringControl={false}
            polygonControl={false}
          />
        </MapGL>
        <button disabled={this.state.polygon} onClick={(event) => { this.setState({ mode: 'draw_polygon' }); event.preventDefault(); }}>Draw Region</button>
      </div>
    )
  }
}

const mapStyle = {
  "version": 8,
  "name": "OSM Liberty",
  "metadata": {
    "maputnik:license": "https://github.com/maputnik/osm-liberty/blob/gh-pages/LICENSE.md",
    "maputnik:renderer": "mbgljs"
  },
  "sources": {
    "osm a": {
      "type": "raster",
      "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "minzoom": 0,
      "maxzoom": 19
    },
    "osm b": {
      "type": "raster",
      "tiles": ["https://b.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "minzoom": 0,
      "maxzoom": 19
    },
    "osm c": {
      "type": "raster",
      "tiles": ["https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "minzoom": 0,
      "maxzoom": 19
    }
  },
  "layers": [
    { "id": "A osm", "type": "raster", "source": "osm a" },
    { "id": "B osm", "type": "raster", "source": "osm b" },
    { "id": "C osm", "type": "raster", "source": "osm c" }
  ],
  "id": "osm-liberty"
}
