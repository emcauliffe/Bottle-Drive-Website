import React from 'react';

export default class Logout extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            "message": "logging out ..."
        }
    }

    componentDidMount() {
        var myHeaders = new Headers();

        var requestOptions = {
            method: 'DELETE',
            headers: myHeaders,
        };

        fetch("/api/auth/login", requestOptions)
            .then(response => {
                if (response.status === 200) {
                    this.setState({ message: "Logged out." })
                } else {
                    throw new Error(response)
                }
            })
            .catch(error => console.log('error', error));
    }

    render() {
        return (
            <div>
                <h1>{this.state.message}</h1>
                <a href="/login">Click here to log in again</a>
            </div>
        )
    }
}