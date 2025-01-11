import React from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
} from "@material-ui/core";
import "./App.css";

export function App() {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const ws = React.useRef(null);

  React.useEffect(() => {
    ws.current = new WebSocket("ws://192.168.1.2:8080");

    ws.current.onmessage = (event) => {
      const incomingMessage = event.data;
	  console.log(event);
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    };

    return () => {
      console.log("closing connection");
      ws.current.close();
    };
  }, []);

  const sendMessage = (type) => {
	if(message.trim() === '') return;
    const messageObject = {
      type,
      message,
    };
    ws.current.send(JSON.stringify(messageObject));
    setMessage("");
  };

  return (
    <Container maxWidth="sm" style={{ padding: "20px" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Chat UI
      </Typography>
      <Paper style={{ padding: "10px", height: "300px", overflowY: "scroll" }}>
        <List>
          {messages?.map((msg, index) => (
            <ListItem
              key={index}
              style={{
                margin: "10px 0",
                background: "#848487",
                color: "#fff",
                textAlign: "right",
                borderRadius: "5px",
                width: "fit-content",
              }}
            >
              <b style={{marginRight: '10px'}}>{JSON.parse(msg).message}</b> {" \n "}
			  <br />
              <i style={{color:'red'}}>{JSON.parse(msg).senderId}</i>
            </ListItem>
          ))}
        </List>
      </Paper>
      <div style={{ display: "flex", marginTop: "10px" }}>
        <TextField
          variant="outlined"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => sendMessage("private")}
          style={{ marginLeft: "10px" }}
        >
          Send
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => sendMessage("broadcast")}
          style={{ marginLeft: "10px" }}
        >
          Broadcast
        </Button>
      </div>
    </Container>
  );
}

export default App;
