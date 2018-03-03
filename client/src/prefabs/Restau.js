import React, { Component } from 'react';
import Promo from './Promo';

class Restau extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRestaurant: false,
    };
  }

  hide()
  {
    this.setState({showRestaurant : false});
  }

  show()
  {
    this.setState({showRestaurant : true});
  }

  doNothing()
  {
      return null;
  }
  
  render() {

    if (this.state.showRestaurant===false) {
    return (
    <Promo id={this.props.id} show={this.show.bind(this)} />
  );
    }

    return (
      <div class="card text-center">
        <div class="card-header"  id="headingOne">
          <h2 class="restauCard">
            <a href={this.props.url}> {this.props.name}  </a> {'★'.repeat(+this.props.stars)}
          </h2>
        </div>
        <div id={this.props.id} class="row" aria-labelledby="headingOne">
          <div class="card-body ">
          <h3 class="promoCard">
            <Promo name={this.props.name} id={this.props.id} show={this.doNothing.bind(this)} />
          </h3>
          </div>
        </div>
      </div>
    )
  }
}

export default Restau;