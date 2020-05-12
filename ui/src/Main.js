import React from 'react';
import { Switch, Route } from 'react-router-dom';

// import Home from '../pages/Home';
import Login from './Login';
import Register from './Register'
import PickupRegister from './PickupRegister';
import ViewDrives from "./ViewDrives";
import Logout from "./Logout"

const Main = () => {
  return (
    <Switch> {/* The Switch decides which component to show based on the current URL.*/}
      {/* <Route exact path='/' component={Home}></Route> */}
      <Route exact path='/signup' component={Register}></Route>
      <Route exact path='/login' component={Login}></Route>
      <Route exact path='/list' component={ViewDrives}></Route>
      <Route exact path='/logout' component={Logout}></Route>
      <Route exact path='/(\w{5})' component={PickupRegister}></Route>
    </Switch>
  );
}

export default Main;