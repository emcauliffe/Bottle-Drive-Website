import React from 'react';

export default class ViewDrives extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            "drivesArray": []
        }

        this.loadDrives = this.loadDrives.bind(this)
        this.updateDrives = this.updateDrives.bind(this)
        this.toggleDateActive = this.toggleDateActive.bind(this)
    }

    componentDidMount() {
        this.loadDrives()
    }

    loadDrives() {
        fetch("/api/view")
            .then(response => response.json())
            .then(result => this.setState({ drivesArray: result }))
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
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
    }

    toggleDateActive(event) {
        
        const index = event.target.name
        const activeVal = this.state.drivesArray[index].active
        let newDrivesArray = JSON.parse(JSON.stringify(this.state.drivesArray))
        newDrivesArray[index].active = !activeVal
        this.setState({drivesArray:newDrivesArray})
    }

    render() {
        return (
            <div>
                <h1>Your bottle drives</h1>
                <DrivesTable
                    drivesArray={this.state.drivesArray}
                    headersArray={["Date", "Boxes signed up", "Boxes limit", "Active", "Download Spreadsheet", "Add/Delete"]}
                    changeActive={this.toggleDateActive}
                    style={{
                        "width": "100%",

                    }}
                />
                <button onClick={this.loadDrives}>Undo Changes</button>
                <button onClick={this.updateDrives}>Save Changes</button>
                <br />
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
                {/* <td><input type="number" value={elem.crates_limit}/></td> */}
                <td>{elem.crates_limit}</td>
                <td><input type="checkbox" checked={elem.active} onChange={props.changeActive} name={i} /></td>
                {/* name={elem.date} */}
                <td onClick={() => console.log("clicked")}><span role="img" aria-label="click to download">⬇️</span></td>
                <td><span role="img" aria-label="click to delete">❌</span></td>
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
                    <td><input type="date" /></td>
                    <td>--</td>
                    <td><input type="number" min="1" /></td>
                    <td><input type="checkbox" /></td>
                    <td>--</td>
                    <td><span role="img" aria-label="click to add">➕</span></td>
                </tr>
            </tbody>
        </table>
    )
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']