import React, { Component } from 'react';
import {Link} from 'react-router'

export default class extends Component {
  render(){
    return (
      <div className="App-intro">
        <h2>Home/App Component</h2>
        <br/>
        <h3>Welcome to the Home Page</h3>
        <br/>
        To get started, edit <code>src/App.js</code> and save to reload.
        <br/>
        <br/>
        <Link to="/custom">custom</Link>
      </div>
    )
  }
}
