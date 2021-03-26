import axios from "axios";
import React, { Component } from "react"; 
import './Database.css';
import Collapsible from "../components/Collapsible";

class Database extends Component {
  constructor() {
    super();
    this.state = {
        users:[],
        limit: 8,
        open: false,
    };
  }

  componentDidMount() {
    axios.get(process.env.REACT_APP_API_URL + "/users/", { params: { limit: this.state.limit } }).then(
        (res) => {
          if(res.data) {
            this.setState({users: res.data});
          }
        })
  }
  removeName = (user) => {
    const userCopy = {...user};
    delete userCopy.name;
    return userCopy;
  }

  userToString = (user) => {
    let string = "";
    for (const [key, value] of Object.entries(user)) {
      string += `${key}: ${value}\n`;
    }
    return string
  }

  render() {
    return (      
      <div>
      <h1 className="headerTitle">Database</h1>
      {this.state.users.map((user) =>
        <Collapsible key={user.name} title={user.name}>
          <div>
             <p>{this.userToString(this.removeName(user))}</p>
          </div>
        </Collapsible>
      )}
  </div>

    );
  }
}

export default Database;