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
      "pickupDates": [0],
      "mornPickup": false,
      "aftPickup": false,
      "evePickup": false,
      "crates_limit": "",
      "stops_limit": "",
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.newRegion = this.newRegion.bind(this)
    this.handleDateAdded = this.handleDateAdded.bind(this)
    this.addPickupDate = this.addPickupDate.bind(this)
    this.removePickupDate = this.removePickupDate.bind(this)
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

  handleDateAdded(event) {
    this.setState({ pickupDates: [...this.state.pickupDates, 0] })
    event.preventDefault();
  }

  addPickupDate(event) {
    const index = event.target.name
    let newPickupDates = [...this.state.pickupDates]
    newPickupDates[index] = event.target.value

    this.setState({
      pickupDates: newPickupDates
    })
  }

  removePickupDate(event) {
    const index = event.target.name
    let newPickupDates = [...this.state.pickupDates]
    newPickupDates[index] = null

    this.setState({
      pickupDates: newPickupDates
    })
    event.preventDefault();
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
    if (this.state.crates_limit < 1) {
      alerts.push("Maximum number of crates cannot be zero")
    }
    if (this.state.mornPickup === false && this.state.aftPickup === false && this.state.evePickup === false) {
      alerts.push("Please select a pickup timeslot")
    }
    if (new Set(this.state.pickupDates).size !== this.state.pickupDates.length){ //returns true if there are duplicates
      alerts.push("All dates must be unique")
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

      let onlyDates = [] //remove any null dates from state
      this.state.pickupDates.map(i => {
        if (i !== null) {
          onlyDates.push(i)
        }
      })

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var signupData = JSON.stringify({
        "name": this.state.name,
        "email": this.state.email,
        "password": this.state.password,
        "geo_region": this.state.geo_region.features[0].geometry,
        "pickup_times": {
          "days": onlyDates,
          "times": [this.state.mornPickup, this.state.aftPickup, this.state.evePickup],
        },
        "default_crates_limit": this.state.crates_limit,
        // "stops_limit":this.state.stops_limit
      })

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: signupData,
        redirect: 'follow',
      };

      fetch("/api/auth/register", requestOptions)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

    }
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Register to create a bottle drive:
                </p>
          <form onSubmit={this.handleNewRegistration}>
            <label>
              Your name:
                <input name="name" type="text" value={this.state.name} onChange={this.handleInputChange} required />
            </label>
            <br />
            <br />
            <label>
              email:
                    <input name="email" type="email" value={this.state.email} onChange={this.handleInputChange} required />
            </label>
            <br />
            <br />
            <label>
              create password:
                    <input name="password" type="password" value={this.state.password} onChange={this.handleInputChange} required />
            </label>
            <br />
            <label>
              verify password:
                    <input name="password_verify" type="password" value={this.state.password_verify} onChange={this.handleInputChange} required />
            </label>
            <br />
            <br />
            <label>
              Pickup region:
            </label>
            <br />
            <Map newRegion={this.newRegion} width="100%" height="400px" />
            <br />
            <br />
            <label>
              Max. crates collected per week:
                    <input name="crates_limit" type="number" value={this.state.crates_limit} onChange={this.handleInputChange} required />
            </label>
            <br />
            <br />
            <label>Pick your collection dates:</label>
            <br />
            <NumberList numbers={this.state.pickupDates} updateDate={this.addPickupDate} deleteDate={this.removePickupDate} />
            <button onClick={this.handleDateAdded}>Add another date</button>
            <br />
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
            <input type="submit" value="Sign up" />
          </form>
        </header>
      </div>
    )
  }
}

function NumberList(props) {
  const numbers = props.numbers;
  let index = -1;
  const listItems = numbers.map(number => {
    index++;
    if (number !== null) {//indexes with null value have been deleted and will not be shown
      if (index === 0) { //can't delete the first day
        return <li key={index}><input type="date" placeholder="yyyy-mm-dd" pattern="((18|19|20)[0-9]{2}[\-.](0[13578]|1[02])[\-.](0[1-9]|[12][0-9]|3[01]))|(18|19|20)[0-9]{2}[\-.](0[469]|11)[\-.](0[1-9]|[12][0-9]|30)|(18|19|20)[0-9]{2}[\-.](02)[\-.](0[1-9]|1[0-9]|2[0-8])|(((18|19|20)(04|08|[2468][048]|[13579][26]))|2000)[\-.](02)[\-.]29" name={index} onChange={props.updateDate} required /></li>
      } else { //other days have a delete button
        return <li key={index}><input type="date" placeholder="yyyy-mm-dd" pattern="((18|19|20)[0-9]{2}[\-.](0[13578]|1[02])[\-.](0[1-9]|[12][0-9]|3[01]))|(18|19|20)[0-9]{2}[\-.](0[469]|11)[\-.](0[1-9]|[12][0-9]|30)|(18|19|20)[0-9]{2}[\-.](02)[\-.](0[1-9]|1[0-9]|2[0-8])|(((18|19|20)(04|08|[2468][048]|[13579][26]))|2000)[\-.](02)[\-.]29" name={index} onChange={props.updateDate} required /><button name={index} onClick={props.deleteDate}>✕</button></li>
      }
    } else {
      return null;
    }
  });
  return (
    <ul style={{ listStyleType: "none" }}>{listItems}</ul>
  );
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
    "osm": {
      "type": "raster",
      "tiles": ["https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}@2x.png"],
      "minzoom": 0,
      "maxzoom": 19
    }
  },
  "layers": [{ "id": "osm", "type": "raster", "source": "osm", "maxzoom": 24 }],
  "id": "osm-liberty"
}