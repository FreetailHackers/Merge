import axios from "axios";
import React, { Component } from "react"; 
import './Database.css';
import Collapsible from "../components/Collapsible";
import { UserToParagraph } from "../components/UserToParagraph";
import { Pagination } from '../components/Pagination';

class Database extends Component {
  constructor() {
    super();
    this.state = {
        users: [],
        limit: 8,
        keys: [],
        page: this.parsePageNumberHash(window.location.hash),
        filter: {
          name: '',
          university: '',
          skills: ''
        },
        lastDateSent: 0
    };
  }

  parsePageNumberHash = () => {
    const hash = window.location.hash;
    if (hash.length === 0 || !/#[0-9]+/.test(hash)) {
      return 1;
    } else {
      return parseInt(hash.substring(1));
    }
  }

  getUsersFromAPI = () => {
    const filterParameters = {};
    for (const key in this.state.filter) {
      filterParameters[key + 'Filter'] = this.state.filter[key];
    }

    const dateSent = new Date();

    if (dateSent < this.state.lastDateSent) return;

    this.setState({
      lastDateSent: dateSent
    }, () => {
      axios.get(process.env.REACT_APP_API_URL + "/users/", 
      { 
        params: {
          limit: this.state.limit,
          page: this.state.page,
          ...filterParameters,
          dateSent: dateSent.toString()
        } 
      }).then((res) => {
        if(res.data && res.data.dateSent.toString() === this.state.lastDateSent.toString()) {
          this.setState({
            users: res.data.users, 
            keys: Object.keys(res.data.users[0]).filter(this.filterOutNameKey)
          });
        }
      });
    });
  }

  componentDidMount() {
    this.getUsersFromAPI();
  }

  filterOutNameKey = (key) => key !== 'name'  

  setPage = (page, e) => {
    if (e) e.preventDefault();

    this.setState({page}, () => {
      this.getUsersFromAPI();
      this.props.history.push(`#${page}`);
    });
  }

  updateFilter = (e) => {
    this.setState({
      filter: {
        ...this.state.filter,
        [e.target.name]: e.target.value
      }
    }, () => {
      this.getUsersFromAPI();
    });
  }

  render() {
    return (
      <section>
        <h1 className="headerTitle">Database</h1>
        {Object.keys(this.state.filter).map((key, i) => <div key={i} className='filterInput'>
          <label>Filter by {key}</label>
          <input 
            name={key}
            value={this.state.filter[key]} 
            placeholder={`${key}`}
            type='text'
            onChange={this.updateFilter}
          />  
        </div>)}
        <br /><br />
        {this.state.users.map((user, index) =>
          <Collapsible key={index} title={user.name}>
            <UserToParagraph user={user} keys={this.state.keys} />
          </Collapsible>
        )}
        <Pagination page={this.state.page} setPage={this.setPage} />
      </section>
    );
  }
}

export default Database;