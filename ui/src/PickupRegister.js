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
            "header": "",
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
            "message": "",
            "disabled": true,
            "promptSearch": false,
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
        try {
            this.setState({ promptSearch: false })
            const address = result.raw.address.house_number + " " + result.raw.address.road + ", " + result.raw.address.city + ", " + result.raw.address.state
            const latLong = [parseFloat(result.raw.lat), parseFloat(result.raw.lon)]
            this.setState({ address: address, address_latLong: latLong })
            const isIn = PointIn(this.state.geo_region.coordinates[0], [latLong[1], latLong[0]])//the geoJSON is stored as lonLat, so reverse latLong order (non-destructive)
            if (isIn > 0) {
                this.setState({ disabled: true })
                this._geoSuggest.clear()
            } else {
                this.setState({ disabled: false })
            }
            this.setState({ isIn: isIn })
        } catch {
            this.setState({ isIn: 1 })
        }
    }

    getMaxCrates() {
        if (this.state.dates_and_crates_left !== "" && this.state.selectedDate !== "") {
            return this.state.dates_and_crates_left[this.state.selectedDate.split(',')[1]][1]
        } else {
            return null
        }

    }

    pickupTimeString() {
        let output = []
        if (this.state.pickup_times[0] === true) {
            output.push("mornings")
        }
        if (this.state.pickup_times[1] === true) {
            output.push("afternoons")
        }
        if (this.state.pickup_times[2] === true) {
            output.push("evenings")
        }

        if (output.length === 2) {
            output.splice(1, 0, " and ")
        } else if (output.length === 3) {
            output.splice(1, 0, ", ")
            output.splice(3, 0, " and ")
        }

        // switch (output.length) {
        //     case 2:
        //         output.splice(1, 0, " and ")
        //         break;
        //     case 3:
        //         output.splice(1, 0, ", ")
        //         output.splice(3, 0, " and ")
        //         break;
        //     default:
        //         break;
        // }

        return output.join("");
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
        if (this.state.disabled === true) {
            this.setState({ promptSearch: true })
        } else if (this.validateInput() === true) {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const signupData = {
                "details": {
                    "name": this.state.name,
                    "homeAddress": this.state.address,
                    "email": this.state.email,
                    "crates": parseInt(this.state.twelvePack) + parseInt(this.state.sixPack) + parseInt(this.state.beerBottles),
                    "message": this.state.message,
                },
                "date": this.state.dates_and_crates_left[this.state.selectedDate.split(',')[1]][0],
                "message": this.state.message,
                "token": this.state.hCaptcha_token
            }

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(signupData),
                redirect: 'follow',
            };

            fetch("/api/" + this.state.link_code, requestOptions)
                .then(response => {
                    if (response.status === 200) {
                        const times = ["07:00 (7 a.m.)", "12:00 (noon)", "17:00 (5 p.m.)"]
                        let i = 0
                        while (this.state.pickup_times[i] === false) {
                            i++
                        }
                        const params = new URLSearchParams({
                            "date": signupData.date,
                            "crates": signupData.details.crates,
                            "address": signupData.details.homeAddress,
                            "time": times[i],
                        })
                        window.location.assign("/success?" + params.toString())
                    } else if (response.status === 400) {
                        alert("Thank you, but this address is already signed up at this date")
                    } else {
                        throw new Error(response)
                    }
                })
                .catch(error => console.log('error', error));
        }
        event.preventDefault();
    }

    componentDidMount() {
        fetch("/api/" + this.state.link_code)
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else if (response.status === 404) {
                    window.location.replace("/404")
                }
            })
            .then(result => {
                let center = polylabel(result.geo_region.coordinates)
                this.setState({ center: [center[1], center[0]], ...result })
            })
            .catch(error => console.log('error', error));
    }

    render() {
        return (
            <div>
                <header className="App-header" style={{ margin: 0 }}>
                    <h1>{this.state.drive_name}'s Bottle Drive</h1>
                </header>
                <h2 className="pickup-signup-subheader" hidden={this.state.header === ""}>{this.state.header}</h2>
                <div className="Pickup-Region-Map">
                    <p>Pickup Region:</p>
                    <Map provider={mapTilerProvider}
                        dprs={[1, 2]}
                        center={this.state.center}
                        zoom={12}
                        height={400}
                        metaWheelZoom={true}
                        twoFingerDrag={true}
                    >
                        <Marker anchor={this.state.address_latLong} />
                        <Polygon coordsArray={this.state.geo_region.coordinates[0]} colour="var(--colour-2)" />
                    </Map>
                </div>
                {this.state.dates_and_crates_left.length === 0 ? <p className="card alert">Sorry! There are no more signup dates available.<br />Check again soon to see if any open up.</p> : <p style={{ fontWeight: "bold" }}>Pickups are in the {this.pickupTimeString()}.</p>}
                <form onSubmit={(event) => { event.preventDefault(); this.setState({ promptSearch: true }) }}>
                    <div hidden={this.state.dates_and_crates_left.length === 0 || !this.state.disabled}>
                        <Geolookup
                            placeholder="Search for your address"
                            id="address"
                            disableAutoLookup={true}
                            onSuggestsLookup={onSuggestsLookup}
                            onGeocodeSuggest={onGeocodeSuggest}
                            getSuggestLabel={getSuggestLabel}
                            ref={el => this._geoSuggest = el}
                            types={["geocode"]}
                            autoActivateFirstSuggest={true}
                            style={{
                                'input': { border: "black solid 1px", borderRadius: "5px", padding: "1em", marginRight: "1em" },
                                'suggests': { "margin": 0, "visibility": "hidden", "maxHeight": 0, "overflow": "hidden", "borderWidth": 0 },
                                'suggestItem': { border: "none" },
                            }}
                            onActivateSuggest={this.addressSelected}
                        />
                    </div>
                </form>
                <div className="alert card" hidden={!this.state.promptSearch}>
                    <p>Please click search.</p>
                </div>
                <div className="alert card" hidden={this.state.isIn !== 1}>
                    <p><b>Sorry! You're not in our pickup area.</b><br />If this sounds wrong, try adding the more detail to your search ex. "123 Random St, Etobicoke".<br />The detected address will automatically appear on the map.</p>
                </div>
                <form onSubmit={this.onSubmit}>
                    <div hidden={this.state.disabled} className="card">
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <p style={{ margin: "1em" }}>{this.state.address} <input type="button" value="×" style={{ background: "white", color: "red", border: "red solid 1px", borderRadius: "5px", cursor: "pointer", padding: "0.3em" }} onClick={(event) => { this.setState({ disabled: true, address: "", promptSearch: false }, this._geoSuggest.clear) }} /></p>
                            <input className="pickup-signup-input" placeholder="Your name" type="text" name="name" value={this.state.name} onChange={this.handleInputChange} disabled={this.state.disabled} required />
                            <input className="pickup-signup-input" placeholder="Your email" type="email" name="email" value={this.state.email} onChange={this.handleInputChange} disabled={this.state.disabled} required />
                            <DatesSelect
                                options={this.state.dates_and_crates_left.map(i => new Date(i[0]))}
                                onChange={this.handleInputChange}
                                value={this.state.selectedDate}
                                name="selectedDate"
                                placeholder="Select pickup date:"
                                className="pickup-signup-input"
                            />
                        </div>
                        <br />
                        <div hidden={this.state.selectedDate === ""}>
                            <p className="alert">You can have a maximum of <b>{this.getMaxCrates()} box{this.getMaxCrates() > 1 ? "es" : ""}</b> picked up on this date.</p>
                            <p className="alert"><b>Only bottles in wine or beer bottle boxes will be picked up.</b> <a href="/faq">Check our FAQ for more details.</a></p>
                            <table style={{ textAlign: "right", margin: "auto" }}>
                                <tr>
                                    <td>Number of 12 bottle wine/spirit boxes:</td>
                                    <td>
                                        <input
                                            disabled={this.state.selectedDate === ""}
                                            type="number"
                                            name="twelvePack"
                                            value={this.state.twelvePack}
                                            onChange={this.handleInputChange}
                                            max={this.getMaxCrates() - this.state.sixPack - this.state.beerBottles}
                                            min={0}
                                            className="pickup-signup-input"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Number of 6 bottle wine/spirit boxes:</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="sixPack"
                                            value={this.state.sixPack}
                                            onChange={this.handleInputChange}
                                            disabled={this.state.selectedDate === ""}
                                            max={this.getMaxCrates() - this.state.twelvePack - this.state.beerBottles}
                                            min={0}
                                            className="pickup-signup-input"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Number of 24/28 bottle beer boxes:</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="beerBottles"
                                            value={this.state.beerBottles}
                                            onChange={this.handleInputChange}
                                            disabled={this.state.selectedDate === ""}
                                            max={this.getMaxCrates() - this.state.sixPack - this.state.twelvePack}
                                            min={0}
                                            className="pickup-signup-input"
                                        />
                                    </td>
                                </tr>
                            </table>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                                <label> Message: </label>
                                <textarea className="pickup-signup-input" rows={1} name="message" value={this.state.message} onChange={this.handleInputChange} placeholder="optional" />
                            </div>
                            <div style={{ margin: "1em" }}>
                                <HCaptcha sitekey="aca48aca-c9cd-472d-ba6b-02eee619baf9" onVerify={this.onVerifyCaptcha} />
                            </div>
                            <input type="submit" value="Register" />
                        </div>
                    </div>
                    <br />
                    <br />
                </form>
            </div>
        );
    }
}

function mapTilerProvider(x, y, z, dpr) {
    return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`
}

function Polygon({ mapState: { width, height }, latLngToPixel, coordsArray, colour }) {

    let coords = ""

    for (let i = 0; i < coordsArray.length; i++) {
        let latLngPixels = latLngToPixel([coordsArray[i][1], coordsArray[i][0]])
        coords += `${latLngPixels[0]},${latLngPixels[1]} `
    }

    return (
        <svg width={width} height={height} style={{ fill: colour, opacity: 0.4, top: 0, left: 0 }}>
            <polygon points={coords} />
        </svg>
    )
}

function DatesSelect(props) {

    let selectOptions = props.options.map((date, i) => {
        return (
            <option key={i} value={[date, i]}>
                {daysOfWeek[date.getUTCDay()] + ", " + monthsOfYear[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + date.getUTCFullYear()}
            </option>
        )
    })

    return (
        <select style={props.style} className={props.className} defaultValue={props.placeholder} name={props.name} onChange={props.onChange} disabled={props.disabled} required>
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