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
      <div className="App">
        <header className="App-header">
          <p>
            Login:
                </p>
          <form onSubmit={this.handleLoginSubmit}>
            <label>
              email:
                    <input name="email" type="email" value={this.state.email} onChange={this.handleInputChange} />
            </label>
            <br />
            <br />
            <label>
              password:
                    <input name="password" type="password" value={this.state.password} onChange={this.handleInputChange} />
            </label>
            <br />
            <br />
            <input type="submit" value="Login" />
          </form>
          <p hidden={!this.state.unauthorized}>Invalid username or password.</p>
          <p><a href="/signup">Click here to sign up.</a></p>
        </header>
      </div>
    );
  }
}
