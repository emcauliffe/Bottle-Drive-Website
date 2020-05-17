import React from 'react';
import qs from 'qs';
import './App.css';

export default class PickupConfirmation extends React.Component {

    constructor(props){
        super(props)
        this.state = qs.parse(this.props.location.search , { ignoreQueryPrefix: true })
    }

    render(){
        return(
            <div>
                <header className="App-header">
                <h1>Success!</h1>
                </header>
                <div className="card">
                <p>You're registered for pickup of {this.state.crates} box(es) at {this.state.address} on {this.state.date}.</p>
                <p>Please have your boxes out by {this.state.time}. Thank you for your support!</p>
                <a href="/faq.html">Check out or FAQ for more information.</a>
                </div>
            </div>
        )
    }
}