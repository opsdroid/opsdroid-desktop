'use strict';


//////
// Imports
import React from 'react';
import md5 from 'md5';

import Message from './Message';


export default class Conversation extends React.Component {
  generateKey(item) {
    return md5(JSON.stringify(item));
  }

  render() {
    return (
      <ul id="conversation">
          {this.props.items.map(item => (
            <Message text={item["text"]} user={item["user"]}
                     time={item["time"]} key={this.generateKey(item)}
                     image={item["image"]} />
          ))}
      </ul>
    );
  }

  componentDidUpdate() {
    // Scroll down to show new messages
    window.scrollTo(0, document.body.scrollHeight);
  }
}
