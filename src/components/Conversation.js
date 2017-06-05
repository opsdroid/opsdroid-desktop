'use strict';


//////
// Imports
import React from 'react';
import md5 from 'md5';

import Message from './Message';


export default class Conversation extends React.Component {
  generateKey(item){
    return md5(item["user"] + item["text"] + item["time"].toTimeString());
  }

  render(){
    return (
      <ul id="conversation">
          {this.props.items.map(item => (
            <Message text={item["text"]} user={item["user"]}
                     time={item["time"]} key={this.generateKey(item)} />
          ))}
      </ul>
    );
  }

  componentDidUpdate(){
    // Scroll down to show new messages
    window.scrollTo(0, document.body.scrollHeight);
  }
}
