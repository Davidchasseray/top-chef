import React, { Component } from 'react';
import './App.css';
import'./bootstrap.min.css'
import Restaurants from './prefabs/Restaurants';

class App extends Component {
  render() {
    return (
      <div class="backG">
        <div class="container text-center">
          <div class="row"/>
            
          
            <div class="col text-center">
            <h1 class="titleCard" > TOP-CHEF PROJECT </h1>
            <h2 class="promoCard">
              Please choose the offer that pleases you the most and click on the name of the restaurant to go on LaFourchette and book.
            </h2>  
              <Restaurants />
            </div>
          <div class="row"/>
          

        </div>
      </div>
    );
  }
}

export default App;
