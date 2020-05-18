import React from 'react';
import qs from 'qs'
import './App.css'

export default class LocationSearch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            query: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }),
            response: [],
        }
    }

    componentDidMount() {
        fetch(`/api/search?lat=${this.state.query.lat}&long=${this.state.query.long}`)
            .then(result => result.json())
            .then(response => this.setState({ response: response }))
            .catch(error => console.log(error))
    }

    render() {
        return (
            <div>
                <header className="App-header">
                    <h1>Bottle drives near you:</h1>
                </header>
                <div style={{ pointerEvents: "none" }} className="alert card" hidden={this.state.query.postal === 'false'}>
                    <p><b>Note:</b> Searching by postal code is less accurate. Drives listed here may not be available in your region.</p>
                </div>
                <DriveCards drivesArray={this.state.response} />
            </div>
        )
    }
}

function DriveCards(props) {

    let cards = []

    if (props.drivesArray.length > 0) {
        cards = props.drivesArray.map((elem, i) => {
            return (
                <a style={{ textDecoration: "none" }} href={`/${elem.link_code}`} key={i}>
                    <div className="card">
                        <h2>{elem.name}'s Bottle drive</h2>
                        <p>{elem.header}</p>
                    </div>
                </a>
            )
        })
    } else {
        cards.push(
            <div key={1}>
                <h2>Sorry! There are no drives currently running in your area.</h2>
                <a href="/signup">Start one today!</a>
            </div>
        )
    }

    return (
        <div>
            {cards}
        </div>
    )
}