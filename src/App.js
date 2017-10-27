import React, { Component } from 'react';
import ReactDOM from "react-dom";
import UMBCLogo from "./images/umbc_logo.png";
import { Button, Row, Col } from "react-bootstrap";
import ChatBox from "./components/ChatBox/ChatBox";
import HeadSetLogo from "./images/headset.jpg";
import UserLogo from "./images/user.png";
import './App.css';
function getDifference(a, b)
{
    let result = 0;
    for (let i = 0; i < b.length; i++) {
      if (a[i] != b[i]) {
        result += 1;
      }
    }
    return result;
}
class App extends Component {
  constructor(props) {
    super(props);
    this.answers = "ACBACBBACDADBCBBBBCACAACEDDEECDBBADEBCBA";
    this.state ={
      showInitial: "all",
      showMain: "none",
      showChatBox: "none",
      showChatWindow: "none",
      showError: "none",
      count: 1,
      experimentDone: false,
      chatMessage: "",
      returnButton: "none",
      textInput: "",
      timer: "",
      questions: [7,8,13,15,19,23,26,29,32,36,39],
      answers: "",
      currentImage: [require("./images/questions/1.png")],
      finished: false,
      chatHistory: [],
      timerPause: false,
      experimentEntered: false
    }
    //console.log(images)
  }
  resetExam = () => {
    this.setState({
      answers: "",
      textInput: "",
      timer: "",
      currentImage: [require("./images/questions/1.png")],
      finished: false,
      count: 1
    });
    this.resetTimer();
  }
  pauseTimer = () => {
    this.setState({
      timerPause: true
    });
  }
  unPauseTimer = () => {
    this.setState({
      timerPause: false
    });
  }
  handleToggleChatWindow = () => {
    if (this.state.showChatWindow === "block") {
      this.setState({
        showChatWindow: "none"
      });
    } else {
      this.setState({
        showChatWindow: "block"
      });
    }
  }
  resetTimer = () => {
    this.setState({
      resetTimer: true
    })
  }
  startTimer(duration) {
    var timer = duration, minutes, seconds;
    var interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10)
        if (this.state.resetTimer === true) {
          clearInterval(interval);
          this.startTimer(15*60);
          this.setState({
            resetTimer: false
          });
        }
        if (minutes === 14 && !this.state.experimentDone && !this.state.experimentEntered) {
          if(this.state.showChatBox != "block") {
            this.setState({
              showChatBox: "block",
              showMain: "none",
              showError: "block",
            });
            this.wsConn.send(JSON.stringify({username: "student", message: "Connected"}));
            this.wsConn.send(JSON.stringify({username: "student", message: "Timestarted: "+minutes+" minutes "+seconds+" seconds"}))
            this.wsConn.send(JSON.stringify({username: "student", message:"CurrentQuestion: "+this.state.count}))
          }
          this.setState({
            experimentEntered: true
          });
        }
        // if (minutes === 7) {
        //   this.setState({
        //     returnButton: "block"
        //   })
        // }
        if (timer === 0) {
          alert("Time is up please stop doing the exam and wait for the instructor")
          let differences = getDifference(this.answers, this.state.answers);
          let correct = this.state.answers.length - differences;
          alert("You answered " + correct + " questions correct out of " + this.state.answers.length + " answered");
          clearInterval(interval);
          this.setState({
            finished: true
          })
          clearInterval(interval);
        }
        seconds = parseInt(timer % 60, 10);

        let minutesDisplay = minutes < 10 ? "0" + minutes : minutes;
        let secondsDisplay = seconds < 10 ? "0" + seconds : seconds;

        this.setState({
          timer: minutesDisplay + ":" + secondsDisplay
        })
        if (this.state.timerPause === false) {
          if (--timer < 0) {
              timer = duration;
          }
        }
    }, 1000);
  }
  initSockets() {
    this.wsConn = new WebSocket("ws://localhost:3030/v1/ws");
    this.wsConn.onmessage = (e) => {
      let chatHistory = this.state.chatHistory;
      let chatObj = JSON.parse(e.data);
      if (chatObj.message === "RESET_EXAM") {
        this.resetExam();
      }
      else if (chatObj.message === "PAUSE_EXAM") {
        this.pauseTimer();
      }
      else if (chatObj.message === "UNPAUSE_EXAM") {
        this.unPauseTimer();
      }
      else if (chatObj.message === "END_EXAM") {
        this.returnExam();
      }
      else {
        chatHistory.push(chatObj);
      }
      this.setState({
        chatHistory: chatHistory
      })
      this.updateScroll();
    }
  }
  componentDidMount() {
    this.initSockets();
    this.updateScroll();
  }
  startTest() {
    this.startTimer(15*60);
    this.setState({
      showInitial: "none",
      showMain: "block"
    })
  }
  validInput(answer) {
    if (answer != 'A' && answer != 'B' && answer != 'C' && answer != 'D' && answer != 'E') {
      alert("Answer must be capital A B C D or E");
      return false;
    } else {
      return true;
    }
  }
  incrementQuestion() {
    // alert("Submitted answer for question #" + this.state.count)
    if (this.state.count + 1 <= 40 && this.validInput(this.state.textInput)) {
    let next = this.state.count + 1;
    let images = []
    if (this.state.questions.includes(next)) {
      images = [require("./images/questions/" + next + "a.png"), require("./images/questions/" + next + "b.png")]
    } else {
      images = [require("./images/questions/" + next + ".png")]
    }
    this.setState({
      count: next,
      textInput: "",
      currentImage: images,
      answers: this.state.answers + this.state.textInput
    })
    }

    if (this.state.count + 1 > 40){
      let differences = getDifference(this.answers, this.state.answers);
      let correct = this.state.answers.length - differences;
      alert("You answered " + correct + " questions correct out of " + this.state.answers.length + " answered");
      this.setState({
        finished: true
      })
    }
  }
  changeText(event) {
    this.setState({
      textInput: event.target.value
    })
  }
  changeChat(event) {
    this.setState({
      chatMessage: event.target.value
    })
  }
  updateScroll () {
      const node = ReactDOM.findDOMNode(this.messagesEnd);
      node.scrollIntoView({ behavior: "smooth" });
  }
  handleChatSend(event) {
    event.preventDefault();
    const message = this.state.chatMessage;
    this.setState({
      chatMessage: ""
    })
    if (this.wsConn.readyState != 1) {
      this.initSockets();
      this.wsConn.send(JSON.stringify({username: "student", message: message}));
    } else {
      this.wsConn.send(JSON.stringify({username: "student", message: message}));
    }
  }
  returnExam() {
    this.setState({
      returnExam: "none",
      showChatBox: "none",
      showError: "none",
      showMain: "block",
      experimentDone: true,
      timerPause: false
    })
  }
  render() {
    let count = 0;
    const chatMessages = this.state.chatHistory.map((obj) => {
      count += 1;
      if(obj.message !== "Connected" 
        && obj.message.indexOf("Timestarted:") === -1 
        && obj.message.indexOf("CurrentQuestion") === -1
        && obj.message !== "CHAT_FINISHED") {
        return (
          <div key={Date.now() + count} style={{ padding: 0, overflow: "hidden" }}>
            {/* {obj.username} : {obj.message} */}
            <Row style={{ padding: "0.5em"}}>
              <Col xs={2} sm={2} lg={2}>
                {obj.username === "student" ? 
                  <img src={UserLogo} style={{ width: 40 }} alt="user" />
                  :
                  <img src={HeadSetLogo} style={{ width: 40 }} alt="admin" />
                }
              </Col>
              <Col xs={10} sm={10} lg={10} style={{ textAlign: "left", paddingLeft: "1.5em", fontSize: "1em" }}>
                <Row><strong>{obj.message}</strong></Row>
                <Row style={{ color: "#c0c0c0" }}>Sent by {obj.username === "student" ? "you" : "Taylor" }</Row>
              </Col>
            </Row>
            <hr style={{ padding: 0, margin: 0 }}/>
          </div>
        )
      }
      if(obj.message === "Connected") {
        return (
          <div key={Date.now() + count} style={{ padding: 0, overflow: "hidden" }}>
        <Row style={{ padding: "0.5em"}}>
        <Col xs={2} sm={2} lg={2}>
            <img src={HeadSetLogo} style={{ width: 40 }} alt="admin" />
        </Col>
        <Col xs={10} sm={10} lg={10} style={{ textAlign: "left", paddingLeft: "1.5em", fontSize: "1em" }}>
          <Row><strong>You are now chatting with Taylor!</strong></Row>
          <Row style={{ color: "#c0c0c0" }}>Sent by System</Row>
        </Col>
        </Row></div> );
      }
    })
    return (
      <div className="App">
        <div className="container">
          <img src={UMBCLogo} width="300" />
          <h1 className="header-font">General Mathematics Student Benchmark</h1>
          <div className="initial-content" style={{ display: this.state.showInitial}}>
          In this section students will be allotted <b>15 minutes</b> to complete
          basic mathematics questions as a general benchmarking process. Once the
          test is started, you cannot pause or go back to it later. It must be finished
          in one sitting.
          <br /><br />
          <Button bsStyle="primary" onClick={this.startTest.bind(this)}>Begin Benchmark</Button>
          </div>
          <div className="show-error" style={{ display: this.state.showError, fontWeight: "bold" }}>
            500 Error : Could not find libxdf12 in location C://Users/UMBCEnterprise/Data/Libraries/
            <br />
            !! DO NOT REFRESH PAGE !!
          </div>
          <div className="math-question" style={{ display: this.state.showMain }}>
            <h3>Question #{this.state.count} - Time Left: <span style={{ color: "red"}}>{this.state.timer}</span></h3>
            <div className="math-question-container">
              {this.state.currentImage.length === 1 ? (<img src={this.state.currentImage[0]} alt="currentQuestion" />) : (
                <div>
                <img src={this.state.currentImage[0]} alt="currentQuestion" />
                <br />
                <img src={this.state.currentImage[1]} alt="currentQuestion" />
                </div>
              )}
              <br />
              <strong style={{ fontSize: "25"}}>Enter your answer choice below (uppercase): </strong><br />
              <input type="text" value={this.state.textInput} onChange={this.changeText.bind(this)} maxlength="1" size="1" />
            </div>
            <Button bsStyle="primary" onClick={this.incrementQuestion.bind(this)}>Submit Answer</Button>
          </div>
          <ChatBox 
            showChatBox={this.state.showChatBox}
            chatMessages={chatMessages}
            handleToggleChatWindow={this.handleToggleChatWindow}
            showChatWindow={this.state.showChatWindow}
            endRefFunc={(el) => {this.messagesEnd = el;}}
            handleSend={this.handleChatSend.bind(this)}
            chatMessage={this.state.chatMessage}
            changeChatFunc={this.changeChat.bind(this)}
          />

          {/*
          <div className="chatBox" id="chat-box"
 style={{ display: this.state.showChatBox}}>
            <strong>Talk with a technical representative</strong>
            <div className="chatData">{chatMessages}
            <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
             </div></div>
            <br />
            <form onSubmit={this.handleChatSend.bind(this)}>
            <input type="text" value={this.state.chatMessage} onChange={this.changeChat.bind(this)} className="message-input" style={{ width: "90%", padding: "0.8em"}} placeholder="Enter a message" />
            </form>
          </div> */}

        </div>
      </div>
    );
  }
}

export default App;
