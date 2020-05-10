import React from 'react';

export default class ViewDrives extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            "drivesArray": [],
            "modified":false,
            "newDrive":{
                "date":"",
                "crates_limit":""
            },
            "delete":[],
        }

        this.loadDrives = this.loadDrives.bind(this)
        this.updateDrives = this.updateDrives.bind(this)
        this.toggleDateActive = this.toggleDateActive.bind(this)
        this.setNewDrive = this.setNewDrive.bind(this)
        this.sendNewDrive = this.sendNewDrive.bind(this)
    }

    componentDidMount() {
        this.loadDrives()
    }

    loadDrives() {
        fetch("/api/view")
            .then(response => response.json())
            .then(result => this.setState({ drivesArray: result, modified: false }))
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
    
        fetch("/api/modify", requestOptions)
          .then(response => response.json())
          .then(this.setState({modified:false}))
          .catch(error => console.log('error', error));

    }

    toggleDateActive(event) {
        const index = event.target.name
        const activeVal = this.state.drivesArray[index].active
        let updatedDrivesArray = JSON.parse(JSON.stringify(this.state.drivesArray)) //provides a deep copy of the object
        updatedDrivesArray[index].active = !activeVal
        this.setState({drivesArray:updatedDrivesArray, modified:true})
    }

    setNewDrive(event) {
        const field = event.target.name
        const value = event.target.value
        let newDriveObj = JSON.parse(JSON.stringify(this.state.newDrive))
        newDriveObj[field] = value

        this.setState({newDrive:newDriveObj})
    }

    sendNewDrive(){
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
    
        fetch("/api/create", requestOptions)
          .then(response => response.json())
          .then(this.loadDrives())
          .catch(error => console.log('error', error));
    }

    render() {
        return (
            <div>
                <h1>Your bottle drives</h1>
                <DrivesTable
                    drivesArray={this.state.drivesArray}
                    newDrive={this.state.newDrive}
                    headersArray={["Date", "Boxes signed up", "Boxes limit", "Active", "Download Spreadsheet", "Add/Delete"]}
                    changeActive={this.toggleDateActive}
                    setNewDrive={this.setNewDrive}
                    sendNewDrive={this.sendNewDrive}
                    style={{
                        "width": "100%",

                    }}
                />
                <button disabled={!this.state.modified} onClick={this.loadDrives}>Undo Changes</button>
                <button disabled={!this.state.modified} onClick={this.updateDrives}>Save Changes</button>
                <br />
                <button>Logout</button>
            </div>
        )
    }
}

function DrivesTable(props) {

    // const totalDrives = props.drivesArray.concat(props.newDriveArray)

    let body = props.drivesArray.map((elem, i) => {
        const dateObj = new Date(elem.date)
        return (
            <tr key={i}>
                <td>{daysOfWeek[dateObj.getUTCDay()]}, {monthsOfYear[dateObj.getUTCMonth()]} {dateObj.getUTCDate()}, {dateObj.getUTCFullYear()}</td>
                <td>{elem.crates}</td>
                <td><input type="number" value={elem.crates_limit} name={i}/></td>
                {/* <td>{elem.crates_limit}</td> */}
                <td><input type="checkbox" checked={elem.active} onChange={props.changeActive} name={i} /></td>
                <td><span role="img" aria-label="click to download" onClick={() => console.log("download")}>⬇️</span></td>
                <td><span role="img" aria-label="click to delete" onClick={() => console.log("delete")}>❌</span></td>
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
                    <td><input type="date" name="date" value={props.newDrive.date} onChange={props.setNewDrive}/></td>
                    <td>--</td>
                    <td><input type="number" name="crates_limit" min="1" value={props.newDrive.crates_limit} onChange={props.setNewDrive}/></td>
                    <td>--</td>
                    {/* <td><input type="checkbox" /></td> */}
                    <td>--</td>
                    <td><span role="img" aria-label="click to add" onClick={props.sendNewDrive}>➕</span></td>
                </tr>
            </tbody>
        </table>
    )
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']