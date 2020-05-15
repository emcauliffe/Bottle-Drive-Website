import React from 'react';
import './App.css';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      unauthorized: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleLoginSubmit(event) {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var loginData = JSON.stringify({
      "email": this.state.email,
      "password": this.state.password
    })

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: loginData,
      redirect: 'follow',
    };

    fetch("/api/auth/login", requestOptions)
      .then(response => {
        if (response.status === 200) {
          window.location.replace(response.url)
        } else if (response.status === 401) {
          this.setState({ email: "", password: "", unauthorized: true })
        }
      })
      .catch(error => {
        console.log('error', error)
      });

    event.preventDefault();
  }

  componentDidMount() {
    fetch("/api/auth/login")
      .then(response => response.json())
      .then(result => result && window.location.replace("/list"))
      .catch(error => console.log(error))
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "90vh", width: "100vw" }}>
        <div className="login-card">
          <h2 style={{ margin: 0, marginBottom: "1em" }}>Login</h2>
          <form onSubmit={this.handleLoginSubmit}>
            <input name="email" type="email" value={this.state.email} onChange={this.handleInputChange} placeholder="email" />
            <br />
            <br />
            <input name="password" type="password" value={this.state.password} onChange={this.handleInputChange} placeholder="password" />
            <br />
            <br />
            <input type="submit" value="Login" style={{ backgroundColor: "white", border:"none", padding: "1em", borderRadius: "5px", fontWeight: "light" }} />
          </form>
        </div>
        <div hidden={!this.state.unauthorized} className="login-card alert" style={{ backgroundColor: "red" }}>
          <p className="closebtn" onClick={() => this.setState({unauthorized:false})}>×</p>
          <p>Invalid username or password.</p>
        </div>
        <div>
          <p><a href="/signup">Sign up here</a></p>
        </div>
      </div>
    );
  }
}
