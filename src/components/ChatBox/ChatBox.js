import React, { Component } from "react";
import { Button, Row, Col } from "react-bootstrap";
import HeadSetImage from "../../images/headset.jpg";
const ChatBox = props => (
    <div className="chatBox" id="chat-box"
    style={{ display: props.showChatBox}}>
               <div className="topBar">
                   Live Technical Support - Online&nbsp;&nbsp;
                   <Button bsSize="small" onClick={props.handleToggleChatWindow}>
                    <strong>{props.showChatWindow === "none" ? "▲" : "▼"}</strong>
                   </Button>
               </div>
               <main style={{ display: props.showChatWindow, height: "400px" }}>
               <Row className="representative-info">
                <Col xs={3} md={3} lg={3}>
                    <img src={HeadSetImage} style={{ width: 50 }} alt="headset" />
                </Col>
                <Col style={{ textAlign: "left" }} xs={9} md={9} lg={9}>
                    <Row>Taylor</Row>
                    <Row>Support agent</Row>
                </Col>
               </Row>
               <div className="chatData">{props.chatMessages}
               <div style={{ float:"left", clear: "both" }}
                ref={props.endRefFunc}>
                </div></div>
               <form onSubmit={props.handleSend} style={{ padding: 0, margin: 0, position: "absolute", bottom: 0, width: "100%" }}>
               <input type="text" value={props.chatMessage} onChange={props.changeChatFunc} className="message-input" style={{ width: "100%", padding: "0.8em"}} placeholder="Enter a message" />
               </form>
               </main>
    </div>
);

export default ChatBox;