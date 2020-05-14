import React from 'react';
import qs from 'qs'

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
                <h1>Drives near you:</h1>
                <p hidden={this.state.query.postal}>Note: search by postal address is less accurate. Drives listed here may not be in your region.</p>
                <DriveCards drivesArray={this.state.response} />
            </div>
        )
    }
}

function DriveCards(props) {

    let cards = []

    if (props.drivesArray.len > 0) {
        cards = props.drivesArray.map((elem, i) => {
            return (
                <a href={`/${elem.link_code}`} key={i}>
                    <h2>{elem.name}'s Bottle drive</h2>
                    <p>{elem.header}</p>
                </a>
            )
        })
    } else {
        cards.push(
            <div>
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