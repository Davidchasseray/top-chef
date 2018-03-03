import React, { Component } from 'react';
import Restau from './Restau';

class Restaurants extends Component {
    constructor(props) {
        super(props);
        this.state = { restaurants: [] };
    }

    componentDidMount() {
        fetch('/api/restaurant?isOnLafourchette=0')
            .then((response) => response.json())
            .then(data => this.setState({ restaurants: data }));
    }

    render() {
        var rows = [];
        this.state.restaurants.forEach((restaurant, index) => {
            rows.push(
                <Restau id={index} name={restaurant.nameOnMichelin} url={restaurant.urlOnLaFourchette} stars={restaurant.stars}  />
            )
        });
        return (
            <div id="accordion">
                {rows}
            </div>
        )
    }
}

export default Restaurants;