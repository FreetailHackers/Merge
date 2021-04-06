import axios from "axios";
import React, { Component } from "react"; 
import './Database.css';
import Collapsible from "../components/Collapsible";

const UserToParagraphFragment = (user, key) => (
  <span key={key}>
    <b>{key}</b>: {user[key]}<br />
  </span>
)

const UserToParagraph = ({user, keys}) => (
  <p>
    { keys.map(key => UserToParagraphFragment(user, key)) }
  </p>
)
class Admin extends Component {
  constructor() {
    super();
    this.state = {
        users: [],
        limit: 8,
        open: false,
        keys: []
    };
  }

  componentDidMount() {
    axios.get(process.env.REACT_APP_API_URL + "/users/", { params: { limit: this.state.limit } }).then((res) => {
      if(res.data) {
        this.setState({
          users: res.data, 
          keys: Object.keys(res.data[0]).filter(this.filterOutNameKey)
        });
      }
    });
  }

  filterOutNameKey = (key) => key !== 'name'

  

  render() {
    return (
      <section>
        <h1 className="headerTitle">Admin</h1>
        {this.state.users.map((user, index) =>
          <Collapsible key={index} title={user.name}>
            <UserToParagraph user={user} keys={this.state.keys} />
          </Collapsible>
        )}
      </section>
    );
  }
}

export default Admin;