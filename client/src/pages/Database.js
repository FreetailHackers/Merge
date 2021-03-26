import axios from "axios";
import React, { Component } from "react"; 
import './Database.css';
import Collapsible from "../components/Collapsible";

class Database extends Component {
  constructor() {
    super();
    this.state = {
        name:[],
        body:[],
        limit: 8,
        open: false,
    };
    this.togglePanel = this.togglePanel.bind(this);
  }

  togglePanel(e) {
    this.setState({open: !this.state.open})
  }   

  componentDidMount() {
    axios.get(process.env.REACT_APP_API_URL + "/api/users/", { params: { limit: this.state.limit } }).then(
        (res) => {
          if(res.data) {
            for (var i = 0; i < res.data.length; i++) {
                const user = res.data[i]; 
                this.setState(prevState => ({
                    name: [...prevState.name, user.name]
                }));
                var temp = "";
                for (const [key, value] of Object.entries(user)) {
                    temp = temp.concat(`${key}: ${value}\n`);
                }
                this.setState(prevState => ({
                    body: [...prevState.body, temp]
                }));
            }
          }
        })
  }

  render() {
    let zip = (a1, a2) => a1.map((x, i) => [x, a2[i]]); 
    var user_data = zip(this.state.name, this.state.body);
    return  (      
    <div>
        <h1 className="headerTitle">Database</h1>
        {user_data.map(([name, body]) =>
          <Collapsible key={name} title={name}>
            <div>
               <p>{body}</p>
            </div>
          </Collapsible>
        )}
    </div>

    );
  }
}

export default Database;