import React from 'react';
import Map from 'pigeon-maps'
import Marker from 'pigeon-marker'
import polylabel from 'polylabel' //to determine centre of the map polygon
import HCaptcha from '@hcaptcha/react-hcaptcha';
import * as Nominatim from 'nominatim-browser';
import Geolookup from 'oleg97-react-geolookup';
import * as PointIn from 'robust-point-in-polygon'

import './App.css';

export default class PickupRegister extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            "drive_name": "",
            "link_code": this.props.match.params[0],
            "center": [0, 0],
            "geo_region": {
                "coordinates": [0]
            },
            "dates_and_crates_left": [],
            "pickup_times": [],
            "hCaptcha_token": "",
            "name": "",
            "email": "",
            "address": "",
            "address_latLong": [0, 0],
            "twelvePack": 0,
            "sixPack": 0,
            "beerBottles": 0,
            "selectedDate": "",
            "disabled": true,
            "isIn": 2,
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.addressSelected = this.addressSelected.bind(this)
        this.getMaxCrates = this.getMaxCrates.bind(this)
        this.pickupTimeString = this.pickupTimeString.bind(this)
        this.onVerifyCaptcha = this.onVerifyCaptcha.bind(this)
        this.validateInput = this.validateInput.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    handleInputChange(event) {
        const target = event.target;
        let value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    addressSelected(result) {
        const address = result.raw.address.house_number + " " + result.raw.address.road + ", " + result.raw.address.city + ", " + result.raw.address.state
        const latLong = [parseFloat(result.raw.lat), parseFloat(result.raw.lon)]
        this.setState({ address: address, address_latLong: latLong })
        const isIn = PointIn(this.state.geo_region.coordinates[0], [latLong[1], latLong[0]])//the geoJSON is stored as lonLat, so reverse latLong order (non-destructive)
        if (isIn > 0) {
            this.setState({ disabled: true })
        } else {
            this.setState({ disabled: false })
        }
        this.setState({ isIn: isIn })
    }

    getMaxCrates() {
        if (this.state.dates_and_crates_left !== "" && this.state.selectedDate !== "") {
            return this.state.dates_and_crates_left[this.state.selectedDate.split(',')[1]][1]
        } else {
            return null
        }

    }

    pickupTimeString() {
        let output = ""
        let trueElems = 0
        this.state.pickup_times.map(i => i === true ? trueElems++ : null)
        if (this.state.pickup_times[0] === true) {
            output += "mornings"
            switch (trueElems) {
                case 2:
                    output += " and ";
                    break;
                case 3:
                    output += ", "
                    break;
                default:
                    break;
            }
        }
        if (this.state.pickup_times[1] === true) {
            output += "afternoons"
            switch (trueElems) {
                case 2:
                    output += " and ";
                    break;
                case 3:
                    output += " and "
                    break;
                default:
                    break;
            }
        }

        if (this.state.pickup_times[2] === true) {
            output += "evenings"
        }
        return output;
    }

    onVerifyCaptcha(token) {
        this.setState({ hCaptcha_token: token })
    }

    validateInput() {
        if (this.state.selectedDate === "") {
            alert("Please select a date.")
            return false
        } else if (this.state.twelvePack + this.state.sixPack + this.state.beerBottles < 1) {
            alert("Number of boxes cannot be zero")
            return false
        } else if (this.state.hCaptcha_token === "") {
            alert("Captcha required")
            return false
        } else {
            return true
        }
    }

    onSubmit(event) {
        if (this.validateInput() === true) {
            var myHeaders = new Headers();
            myHeaders.append("Access-Control-Allow-Origin", "http://localhost:5000");
            myHeaders.append('Access-Control-Allow-Headers', 'Content-Type');
            myHeaders.append("Content-Type", "application/json");

            var signupData = JSON.stringify({
                "name":this.state.name,
                "homeAddress": this.state.address,
                "email": this.state.email,
                "crates": parseInt(this.state.twelvePack) + parseInt(this.state.sixPack) + parseInt(this.state.beerBottles),
                "date": this.state.dates_and_crates_left[this.state.selectedDate.split(',')[1]][0],
                "token": this.state.hCaptcha_token
            })

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: signupData,
                redirect: 'follow',
                mode: 'cors',
            };

            fetch("http://localhost:5000/api/" + this.state.link_code, requestOptions)
                .then(response => response.json())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
        }
        event.preventDefault();
    }

    componentDidMount() {
        fetch("http://localhost:5000/api/" + this.state.link_code)
            .then(response => response.json())
            .then(result => {
                let center = polylabel(result.geo_region.coordinates)
                this.setState({ center: [center[1], center[0]], ...result })
            })
            .catch(error => console.log('error', error));
    }

    render() {
        return (
            <div>
                <h1>{this.state.drive_name}'s Bottle Drive</h1>
                <p>Pickup Region:</p>
                <Map provider={mapTilerProvider}
                    dprs={[1, 2]}
                    center={this.state.center}
                    zoom={12}
                    // width={500}
                    height={400}
                >
                    <Marker anchor={this.state.address_latLong} />
                    <Polygon coordsArray={this.state.geo_region.coordinates[0]} />
                </Map>
                {this.state.dates_and_crates_left.length === 0 ? <p>Sorry! There are no more dates with available collection capacity.<br/>Check again soon to see if any open up.</p> : <p>Pickups are in the {this.pickupTimeString()}.</p>}
                <form hidden={this.state.dates_and_crates_left.length === 0} onSubmit={this.onSubmit}>
                    <label>
                        <Geolookup
                            placeholder="Search for your address"
                            label="Home Address:"
                            id="address"
                            location={this.state.center}
                            disableAutoLookup={true}
                            onSuggestsLookup={onSuggestsLookup}
                            onGeocodeSuggest={onGeocodeSuggest}
                            getSuggestLabel={getSuggestLabel}
                            radius="1"
                            autoActivateFirstSuggest={true}
                            style={{ 'suggests': { "margin": 0, "visibility": "hidden", "maxHeight": 0, "overflow": "hidden", "borderWidth": 0 } }}
                            onActivateSuggest={this.addressSelected}
                        />
                    </label>
                    <p hidden={this.state.isIn !== 1}>Sorry! You're not in our pickup area.<br />If this sounds wrong, try adding the more detail to your search ex. "123 Random St, Etobicoke".<br />The detected address will automatically appear on the map.</p>
                    <label hidden={this.state.disabled}>
                        Name:
                        <input type="text" name="name" value={this.state.name} onChange={this.handleInputChange} disabled={this.state.disabled} required />
                    </label>
                    <br />
                    <label hidden={this.state.disabled}>
                        email:
                        <input type="email" name="email" value={this.state.email} onChange={this.handleInputChange} disabled={this.state.disabled} required />
                    </label>
                    <br />
                    <label hidden={this.state.disabled}>
                        Pickup Date:
                        <DatesSelect
                            options={this.state.dates_and_crates_left.map(i => new Date(i[0]))}
                            onChange={this.handleInputChange}
                            value={this.state.selectedDate}
                            name="selectedDate"
                            placeholder={"Select a date:"}
                            disabled={this.state.disabled}
                        />
                    </label>
                    <br />
                    <p hidden={this.state.selectedDate === ""}>You can have a maximum of {this.getMaxCrates()} box(es) picked up on this date.</p>
                    <label hidden={this.state.disabled}>
                        Number of 12 bottle wine boxes:
                        <input
                            disabled={this.state.disabled || this.state.selectedDate === ""}
                            type="number"
                            name="twelvePack"
                            value={this.state.twelvePack}
                            onChange={this.handleInputChange}
                            max={this.getMaxCrates() - this.state.sixPack - this.state.beerBottles}
                            min={0}
                        />
                    </label>
                    <br />
                    <label hidden={this.state.disabled}>
                        Number of 6 bottle wine boxes:
                        <input
                            type="number"
                            name="sixPack"
                            value={this.state.sixPack}
                            onChange={this.handleInputChange}
                            disabled={this.state.disabled || this.state.selectedDate === ""}
                            max={this.getMaxCrates() - this.state.twelvePack - this.state.beerBottles}
                            min={0}
                        />
                    </label>
                    <br />
                    <label hidden={this.state.disabled}>
                        Number of 24/28 bottle beer boxes:
                        <input
                            type="number"
                            name="beerBottles"
                            value={this.state.beerBottles}
                            onChange={this.handleInputChange}
                            disabled={this.state.disabled || this.state.selectedDate === ""}
                            max={this.getMaxCrates() - this.state.sixPack - this.state.twelvePack}
                            min={0}
                        />
                    </label>
                    <br />
                    <div hidden={this.state.disabled}>
                        <HCaptcha sitekey="aca48aca-c9cd-472d-ba6b-02eee619baf9" onVerify={this.onVerifyCaptcha} disabled={this.state.disabled} />
                    </div>
                    <input hidden={this.state.disabled} type="submit" value="Register" size="compact" />
                    <br />
                    <br />
                </form>
            </div>
        );
    }
}

function mapTilerProvider(x, y, z, dpr) {
    return `https://maps.wikimedia.org/osm-intl/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}.png`
}

function Polygon({ mapState: { width, height }, latLngToPixel, coordsArray }) {

    let coords = ""

    for (let i = 0; i < coordsArray.length; i++) {
        let latLngPixels = latLngToPixel([coordsArray[i][1], coordsArray[i][0]])
        coords += `${latLngPixels[0]},${latLngPixels[1]} `
    }

    return (
        <svg width={width} height={height} style={{ fill: "#51EDFF", opacity: 0.4, top: 0, left: 0 }}>
            <polygon points={coords} />
        </svg>
    )
}

function DatesSelect(props) {

    let selectOptions = props.options.map((date, i) => {
        return (
            <option key={i} value={[date, i]}>
                {daysOfWeek[date.getDay()] + ", " + monthsOfYear[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()}
            </option>
        )
    })

    return (
        <select defaultValue={props.placeholder} name={props.name} onChange={props.onChange} disabled={props.disabled}>
            {props.placeholder ? <option value={props.placeholder} disabled>{props.placeholder}</option> : null}
            {selectOptions}
        </select>
    )
}

function onSuggestsLookup(userInput) {
    return Nominatim.geocode({
        q: userInput,
        addressdetails: true
    });
}

function onGeocodeSuggest(suggest) {
    let geocoded = {};
    if (suggest) {
        geocoded.nominatim = suggest.raw || {};
        geocoded.location = {
            lat: suggest.raw ? suggest.raw.lat : '',
            lon: suggest.raw ? suggest.raw.lon : ''
        };
        geocoded.placeId = suggest.placeId;
        geocoded.isFixture = suggest.isFixture;
        geocoded.label = suggest.raw ? suggest.raw.display_name : '';
    }
    return geocoded;
}

function getSuggestLabel(suggest) {
    return suggest.display_name;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']