import React from 'react';

export default class ViewDrives extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            "drivesArray": [],
            "modified": false,
            "newDrive": {
                "date": "",
                "crates_limit": ""
            },
            "delete": [],
            "link_code":""
        }

        this.loadDrives = this.loadDrives.bind(this)
        this.updateDrives = this.updateDrives.bind(this)
        this.toggleDateActive = this.toggleDateActive.bind(this)
        this.updateCrateLimit = this.updateCrateLimit.bind(this)
        this.deleteDrive = this.deleteDrive.bind(this)
        this.setNewDrive = this.setNewDrive.bind(this)
        this.sendNewDrive = this.sendNewDrive.bind(this)
        
        this.loadDrives()
    }

    loadDrives() {
        fetch("/api/list")
            .then(response => {
                if (response.status === 403){
                    window.location.replace("/login")
                } else if (response.status === 200) {
                    response.json().then(result => this.setState({ drivesArray: result.drives, link_code: result.link_code, modified: false }))
                }
            })
            .catch(error => console.log('error', error));
    }

    updateDrives() {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const driveData = JSON.stringify(this.state.drivesArray)

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: driveData,
            redirect: 'follow',
        };

        fetch("/api/list", requestOptions)
            .then(response => response.json())
            .then(this.setState({ modified: false }))
            .catch(error => console.log('error', error));

    }

    toggleDateActive(event) {
        const index = event.target.name
        const activeVal = this.state.drivesArray[index].active
        let updatedDrivesArray = this.state.drivesArray.map((elem) => elem) //provides a deep copy of the object
        updatedDrivesArray[index].active = !activeVal
        this.setState({ drivesArray: updatedDrivesArray, modified: true })
    }

    updateCrateLimit(event) {
        const index = event.target.name
        const value = event.target.value
        let updatedDrivesArray = this.state.drivesArray.map((elem) => elem) //provides a deep copy of the object
        updatedDrivesArray[index].crates_limit = value
        this.setState({ drivesArray: updatedDrivesArray, modified: true })
    }

    deleteDrive(index) {

        if (window.confirm("Confirm delete drive on " + this.state.drivesArray[index].date + "?")) {

            const deleteDate = this.state.drivesArray[index].date

            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var requestOptions = {
                method: 'DELETE',
                headers: myHeaders,
                body: JSON.stringify({ "date": deleteDate }),
                redirect: 'follow',
            };

            fetch("/api/list", requestOptions)
                .then(response => response.json())
                .then(() => {
                    this.loadDrives()
                })
                .catch(error => console.log('error', error));
        }
    }

    setNewDrive(event) {
        const field = event.target.name
        const value = event.target.value
        let newDriveObj = JSON.parse(JSON.stringify(this.state.newDrive))
        newDriveObj[field] = value

        this.setState({ newDrive: newDriveObj })
    }

    sendNewDrive() {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const driveData = JSON.stringify({
            "date": this.state.newDrive.date,
            "crates_limit": this.state.newDrive.crates_limit
        })

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: driveData,
            redirect: 'follow',
        };

        fetch("/api/list", requestOptions)
            .then(response => response.json())
            .then(() => {
                this.loadDrives()
                this.setState({ newDrive: { "date": "", "crates_limit": "" } })
            })
            .catch(error => console.log('error', error));
    }

    render() {
        return (
            <div>
                <h1>Your bottle drives</h1>
                <DrivesTable
                    drivesArray={this.state.drivesArray}
                    newDrive={this.state.newDrive}
                    headersArray={["Date", "Boxes signed up", "Boxes limit", "Active", "Addresses Spreadsheet", "Add/Delete"]}
                    changeActive={this.toggleDateActive}
                    updateLimit={this.updateCrateLimit}
                    deleteDrive={this.deleteDrive}
                    setNewDrive={this.setNewDrive}
                    sendNewDrive={this.sendNewDrive}
                    style={{
                        "width": "100%",

                    }}
                />
                <button disabled={!this.state.modified} onClick={this.loadDrives}>Undo Changes</button>
                <button disabled={!this.state.modified} onClick={this.updateDrives}>Save Changes</button>
                <br />
                <p>Your shareable link is: <a href={"/"+this.state.link_code}>bottlesagainstcovid.site/{this.state.link_code}</a> <button onClick={()=>navigator.clipboard.writeText(`https://bottlesagainstcovid.site/${this.state.link_code}`)}>copy</button></p>
                <button>Logout</button>
            </div>
        )
    }
}

function DrivesTable(props) {

    let body = props.drivesArray.map((elem, i) => {
        const dateObj = new Date(elem.date)
        return (
            <tr key={i}>
                <td>{daysOfWeek[dateObj.getUTCDay()]}, {monthsOfYear[dateObj.getUTCMonth()]} {dateObj.getUTCDate()}, {dateObj.getUTCFullYear()}</td>
                <td>{elem.crates}</td>
                <td><input type="number" value={elem.crates_limit} name={i} min={elem.crates >= 1 ? elem.crates : 1} onChange={props.updateLimit} /></td>
                {/* <td>{elem.crates_limit}</td> */}
                <td><input type="checkbox" checked={elem.active} onChange={props.changeActive} name={i} disabled={elem.crates >= elem.crates_limit} /></td>
                <td><a href={"/api/download?date=" + elem.date} style={{textDecoration: "none"}} target="_blank" rel="noopener noreferrer"><span role="img" aria-label="click to download">⬇️</span></a></td>
                <td><span role="img" aria-label="click to delete" style={{cursor:"pointer"}} onClick={() => props.deleteDrive(i)}>❌</span></td>
            </tr>
        )
    })

    let headers = props.headersArray.map((elem, i) => {
        return (
            <td key={i} >{elem}</td>
        )
    })

    return (
        <table style={props.style}>
            <thead>
                <tr>
                    {headers}
                </tr>
            </thead>
            <tbody>
                {body}
                <tr>
                    <td><input type="date" name="date" value={props.newDrive.date} onChange={props.setNewDrive} /></td>
                    <td>--</td>
                    <td><input type="number" name="crates_limit" min={1} value={props.newDrive.crates_limit} onChange={props.setNewDrive} /></td>
                    <td>--</td>
                    {/* <td><input type="checkbox" /></td> */}
                    <td>--</td>
                    <td><span role="img" aria-label="click to add" style={{cursor:"pointer"}} onClick={props.sendNewDrive}>➕</span></td>
                </tr>
            </tbody>
        </table>
    )
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']