import React, { Component } from "react";
import { socket } from "../../client-socket.js";
import { get, post } from "../../utilities.js"
import { navigate } from "@reach/router"

import Game from "../modules/Game.js"
import AttendeeList from "../modules/AttendeeList.js"
import HomepageInput from "../modules/HomepageInput.js"
import Header from "../modules/Header.js"

import "../../utilities.css";
import "./GameRoom.css";

class GameRoom extends Component {
  /* Holder for games
   *
   * Proptypes
   * @param {string} gameId
   * (optional) @param {Object} options 
   */
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      attendees: [],
    };

    if (this.props.location.state != null){
      this.setState({username: this.props.location.state.username, displayLoad: true})
    }

    if (this.props.options){
      this.setState({
        started: this.props.options.started,
        username: this.props.options.username,
        gameCreator: this.props.options.gameCreator,
        attendees: this.props.options.attendees,
      });
    }
  }

  setName = (value) => {

    get("/api/verify", {gameId: this.props.gameId}).then( (resp) => {
        if (!resp.ok){
          console.log("room doesn't exist!");
          navigate("/404");
        }

      post('/api/join', {
          gameId: this.props.gameId,
          username: value,
      }).then((a) => {
        this.setState({
          gameCreator: resp.gameCreator,
          started: resp.started,
          username: value,
          attendees: a.attendees
        });
      })

    });
  }

  componentDidMount() {
    console.log("gameroom mounted");
    get("/api/verify", {gameId: this.props.gameId}).then( (resp) => {
        if (!resp.ok){
          console.log("room doesn't exist!");
          navigate("/404");
        }
    });

    // remember -- api calls go here!
    socket.on("attendees", (attendees) => {
      this.setState({attendees: attendees});
    })

    socket.on("gameStart", () => {
      this.setState({started: true});
      console.log("starting game clientside")
    });
  }



  render() {

    if (this.state.displayLoad && !this.state.started){
      return (<div className="Game-loading"><div>loading...</div></div>)
    }
    let toShow;

    if (!this.state.username){
      return (
        <div className="GameRoom-username-input">
          <HomepageInput defaultText="pick a username" buttonText="join room" onSubmit={this.setName}/>
        </div>
      );
    }

    if (this.state.started){
      toShow = (
        <Game gameId={this.props.gameId} username={this.state.username} attendees={this.state.attendees}/>
      )
    } else {
      toShow = (
        <div className="GameRoom-waiting-container">
          <div className="GameRoom-overflow-container">
            <AttendeeList attendees={this.state.attendees}/>
          </div>
          <div className="GameRoom-waiting-blurb">{this.state.gameCreator ? `${this.state.gameCreator} is setting up the game...` : ""}</div>
        </div>
      )
    } 
    return (
      <>
        <Header visible={true} animate={true} />
        {toShow}
      </>
    )

  }
}

export default GameRoom;
