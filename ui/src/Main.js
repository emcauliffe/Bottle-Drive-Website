import React from 'react';
import { BrowserRouter, Switch, Route, useLocation } from 'react-router-dom';

import Home from './Home';
import Login from './Login';
import Register from './Register'
import PickupRegister from './PickupRegister';
import ViewDrives from "./ViewDrives";
import Logout from "./Logout"
import PickupConfirmation from "./PickupConfirmation";

function Main() {
  return (
    <BrowserRouter>
      <Switch> {/* The Switch decides which component to show based on the current URL.*/}
        <Route exact path='/' component={Home}></Route>
        <Route exact path='/signup' component={Register}></Route>
        <Route exact path='/login' component={Login}></Route>
        <Route exact path='/list' component={ViewDrives}></Route>
        <Route exact path='/logout' component={Logout}></Route>
        <Route exact path='/success' component={PickupConfirmation}></Route>
        <Route exact path='/(\w{5})' component={PickupRegister}></Route>
        <Route exact path="*" component={NoMatch}></Route>
      </Switch>
    </BrowserRouter>
  );
}

function NoMatch() {
  let location = useLocation();
  return (
    <div>
      <h1>
        Error 404 page not found.
      </h1>
    </div>
  );
}

export default Main;