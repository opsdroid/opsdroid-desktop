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
      <div className="message">
        { this.props.image &&
          <li className={this.props.user + " image"}
            style={{backgroundImage: 'url(' + this.props.image + ')',}}></li>
        }
        { this.props.text != this.props.image &&
          <li className={this.props.user}>{this.props.text}</li>
        }
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
