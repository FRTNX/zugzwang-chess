import React from 'react';

// import './Timer.css';

const PlayerName = (props) => {
  return (
    <h2 id={props.playerId}><i className="playerIcon fas fa-chess-knight"></i>&nbsp;&nbsp;{props.playerName}</h2>
  );
}

const Timer = (props) => {
  return (
    <div class="timer">
      <span>{props.min}</span>
      <span>:</span>
      <span>{props.sec}</span>
    </div>
  );
}

const Button = (props) => {
  return (
    <button disabled={props.enableButton} onClick={props.handleButtons}>{props.buttonText}</button>
  );
}

const Player1 = (props) => {
  return (
    <div class="player">
      <TimerContainer playerTime={props.playerTime} buttonText={props.buttonText} handleButtons={props.handleButtons} canRunTimer={!props.toggleTimer} enableButton={!props.enableButton} reset={props.reset} />
    </div>
  );
}

const Player2 = (props) => {
  return (
    <div class="player">
      <TimerContainer playerTime={props.playerTime} buttonText={props.buttonText} handleButtons={props.handleButtons} canRunTimer={props.toggleTimer} enableButton={props.enableButton} reset={props.reset} />
    </div>
  );
}

class TimerContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playerTime: this.props.playerTime * 60,
      min: this.props.playerTime,
      sec: "00",
    }
  }

  componentDidMount() {
    console.log('running timer with props: ', this.props)
    if (this.props.canRunTimer) {
      this.runTimer()      
    }

    else {
      this.stopTimer()
    }
  }

  componentDidUpdate(prevProps) {
    // if (prevProps.canRunTimer !== this.props.canRunTimer) {
    //   if (this.props.canRunTimer) {
    //     this.runTimer();
    //   } else {
    //     this.stopTimer();
    //   }
    // }
    // if (prevProps.playerTime !== this.props.playerTime) {
    //   this.setState({
    //     playerTime: this.props.playerTime * 60,
    //     min: this.props.playerTime,
    //   });
    // }
    // if (prevProps.reset !== this.props.reset) {
    //   this.stopTimer();
    //   this.setState({
    //     playerTime: this.props.playerTime * 60,
    //     min: this.props.playerTime,
    //     sec: "00",
    //   });
    // }

    console.log('COMPONENT UPDATE')
  }

  runTimer = () => {
    this.interval = setInterval(() => {
      this.setState({
        playerTime: this.state.playerTime -= 0.01,
      });
      let startTime = this.state.playerTime / 60;
      let m = Math.floor(startTime);
      let min;
      if (m < 10) {
        min = "0" + m;
      } else {
        min = m;
      }
      let s = Math.round((startTime - m) * 60);
      let sec;
      if (s === 60) {
        sec = "00";
        min = m + 1;
      } else if (s < 10) {
        sec = "0" + s;
      } else {
        sec = s;
      }
      this.setState({
        min: min,
        sec: sec,
      });
      if (this.state.playerTime < 1) {
        window.clearInterval(this.interval);
        this.setState({

        });
      }
    }, 10);
  }

  stopTimer = () => {
    window.clearInterval(this.interval);
  }

  render() {
    return (
      <div id="timerContainer">
        <Timer min={this.state.min} sec={this.state.sec} />
        {/* <Button buttonText={this.props.buttonText} handleButtons={this.props.handleButtons} enableButton={this.props.enableButton} /> */}
      </div>
    );
  }
}

export default TimerContainer;