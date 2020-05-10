import React from 'react';

export default class ViewDrives extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            "drivesArray": [],
        }
    }

    componentDidMount() {
        fetch("/api/view")
            .then(response => response.json())
            .then(result => this.setState({ drivesArray: result }))
            .catch(error => console.log('error', error));
    }

    render() {
        return (
            <div>
                <h1>Your bottle drives</h1>
                <DrivesTable
                    drivesArray={this.state.drivesArray}
                    headersArray={["Date", "Boxes signed up", "Boxes limit", "Active", "Download Spreadsheet"]}
                    style={{
                        "width": "100%",

                    }}
                />
                <button>Add new</button>
                <button>Save changes</button>
                <br />
                <button>logout</button>
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
                <td><input type="checkbox" checked={elem.active} /></td>
                <td onClick={()=>console.log("clicked")}><span role="img" aria-label="click to download">⬇️</span></td>
            </tr>
        )
    })

    let headers = props.headersArray.map((elem, i) => {
        return (
            <td>{elem}</td>
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
            </tbody>
        </table>
    )
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']