import React from 'react';
// import './App.css'

export default class UserSettings extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            "name": "",
            "header": "",
            "pickup_times": [false, false, false],
            "changes": false,
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.getSettings = this.getSettings.bind(this)
        this.putSettings = this.putSettings.bind(this)
        this.validateInput = this.validateInput.bind(this)
    }

    handleInputChange(event) {
        const target = event.target;
        let value;
        let name;
        if (target.type === 'checkbox') {
            value = target.checked;
            let newPickup_times = [...this.state.pickup_times];
            newPickup_times[target.name] = value;
            this.setState({ pickup_times: newPickup_times })
        } else {
            value = target.value;
            name = target.name;
            this.setState({
                [name]: value
            });
        }
        this.setState({ changes: true })
    }

    getSettings() {
        fetch("/api/settings")
            .then(response => {
                if (response.status === 403) {
                    window.location.replace("/login")
                } else if (response.status === 200) {
                    response.json().then(result => this.setState(result, this.setState({ changes: false })))
                }
            })
            .catch(error => console.log(error))
    }

    putSettings() {
        if (this.validateInput() === true) {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const userData = JSON.stringify({
                name: this.state.name,
                header: this.state.header,
                pickup_times: this.state.pickup_times,
            })

            var requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: userData,
                redirect: 'follow',
            };

            fetch("/api/settings", requestOptions)
                .then(response => response.json())
                .then(this.setState({ changes: false }))
                .catch(error => console.log('error', error));
        }
    }

    validateInput() {
        if (this.state.name.length < 1) {
            alert("You must provide a name.")
            return false
        } else if (!this.state.pickup_times[0] && !this.state.pickup_times[1] && !this.state.pickup_times[2]) { //if all pickup times are false
            alert("You must select at least one pickup time.")
            return false
        } else {
            return true
        }
    }

    componentDidMount() {
        this.getSettings()
    }

    render() {
        return (
            <div>
                <header className="App-header">
                    <h1>Your settings</h1>
                </header>
                <p>Name: <input className='pickup-signup-input' style={{ width: "60vw" }} placeholder={this.state.name} name="name" type="text" onChange={this.handleInputChange} /></p>

                <p>Header: <input className="pickup-signup-input" style={{ width: "60vw" }} placeholder={this.state.header} name="header" type="text" onChange={this.handleInputChange} /></p>
                <div className="signup-section">
                    <p>Pickup times:</p>
                    <table style={{ textAlign: "center", margin: "auto", marginBottom: "1em" }}>
                        <tbody>
                            <tr>
                                <td>Morning (7:00-11:59)</td>
                                <td><input className="checkmark" type="checkbox" name="0" checked={this.state.pickup_times[0]} onChange={this.handleInputChange} /></td>
                            </tr>
                            <tr>
                                <td>Afternoon (12:00-16:59)</td>
                                <td><input type="checkbox" name="1" checked={this.state.pickup_times[1]} onChange={this.handleInputChange} /></td>
                            </tr>
                            <tr>
                                <td>Evening (17:00-20:00)</td>
                                <td><input type="checkbox" name="2" checked={this.state.pickup_times[2]} onChange={this.handleInputChange} /></td>
                            </tr>
                        </tbody>
                    </table>
                    <button disabled={!this.state.changes} onClick={this.putSettings}>Save changes</button>
                    <button disabled={!this.state.changes} onClick={this.getSettings}>Discard changes</button>
                    <p>Sorry! Pickup region editing not yet available.</p>
                </div>
                <form action="/list">
                    <input value="Back to your bottle drives" type="submit" />
                </form>
                {/* <a href="/list">Back to view my drives page</a> */}
            </div>
        )
    }
}