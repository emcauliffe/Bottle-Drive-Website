import React from 'react'

export default class Home extends React.Component{
    render(){
        return(
            <div>
                <h1>Bottles against COVID-19</h1>
                <h2>About:</h2>
                <p>This website was made to allow others to help</p>
                <h4><a href="/login">Login</a></h4>
                <h4><a href="/signup">Signup</a></h4>
                <p>Check out this website on <a href="https://github.com/emcauliffe/Bottle-Drive-Website">GitHub.</a></p>
            </div>
        )
    }
}