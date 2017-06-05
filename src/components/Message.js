'use strict';


//////
// Imports
import React from 'react';


export default class Message extends React.Component {
  getTime() {
    return this.props.time.toTimeString().replace(/.*(\d{2}:\d{2}):\d{2}.*/, "$1");
  }

  render() {
    return (
      <div>
        <li className={this.props.user}>{this.props.text}</li>
        <li className="clearfix" />
        {this.props.user != "info" &&
        <div>
          <li className={this.props.user + " time"}>
            {this.getTime()}
          </li>
          <li className="clearfix" />
        </div>
        }
      </div>
    );
  }
}
