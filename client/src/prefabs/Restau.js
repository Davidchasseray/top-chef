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
    return (<div class="card-body">
    <Promo id={this.props.id} show={this.show.bind(this)} />
  </div>);
    }

    return (
      <div class="card">
        <div class="card-header" id="headingOne">
          <h5 class="mb-0">
            <button class="btn btn-link" data-toggle="collapse" data-target={'#' + this.props.id} aria-expanded="true" aria-controls="collapseOne">
              {this.props.name}
            </button>
          </h5>
        </div>
        <div id={this.props.id} class="collapse" aria-labelledby="headingOne" data-parent="#accordion">
          <div class="card-body">
            <Promo name={this.props.name} id={this.props.id} show={this.doNothing.bind(this)} />
          </div>
        </div>
      </div>
    )
  }
}

export default Restau;