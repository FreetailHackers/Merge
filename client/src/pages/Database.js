import axios from "axios";
import React, { Component } from "react";
import PropTypes from "prop-types";
import "./Database.css";
import Collapsible from "../components/Collapsible";
import { UserToParagraph } from "../components/UserToParagraph";
import { Pagination } from "../components/Pagination";

class Database extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      limit: 8,
      keys: [],
      page: this.parsePageNumberHash(window.location.hash),
      filter: {
        name: "",
        university: "",
        skills: "",
      },
      lastDateSent: 0,
    };
  }

  parsePageNumberHash = () => {
    const hash = window.location.hash;
    if (hash.length === 0 || !/#[0-9]+/.test(hash)) {
      return 1;
    } else {
      return parseInt(hash.substring(1));
    }
  };

  getUsersFromAPI = () => {
    const filterParameters = {};
    for (const key in this.state.filter) {
      if (this.state.filter[key] !== "")
        filterParameters[key] = this.state.filter[key];
    }
    const dateSent = new Date();
    var queryParamters = {
      start: 0,
      limit: 10,
      dateSent: dateSent.toString(),
      filters: filterParameters,
    };
    if (dateSent < this.state.lastDateSent) return;
    this.setState(
      {
        lastDateSent: dateSent,
      },
      () => {
        axios
          .get(process.env.REACT_APP_API_URL + "/api/users/list", {
            params: queryParamters,
          })
          .then((res) => {
            if (
              res.data &&
              res.data.dateSent.toString() ===
                this.state.lastDateSent.toString()
            ) {
              const keys = [];
              const data = [];
              if (res.data.list[0]) {
                for (const key in res.data.list[0].profile) {
                  if (key !== "_id") keys.push(key);
                }
              }
              for (const user of res.data.list) {
                var profile = {};
                for (const key of keys) {
                  if (user.profile === undefined) {
                    user.profile = {};
                  }
                  profile[key] = user.profile[key];
                }
                profile.name = user.name;
                data.push(profile);
              }
              this.setState({
                users: data,
                keys: keys,
              });
            }
          });
      }
    );
  };

  componentDidMount() {
    this.getUsersFromAPI();
  }

  filterOutNameKey = (key) => key !== "name";

  setPage = (page, e) => {
    if (e) e.preventDefault();

    this.setState({ page }, () => {
      this.getUsersFromAPI();
      this.props.history.push(`#${page}`);
    });
  };

  updateFilter = (e) => {
    this.setState(
      {
        filter: {
          ...this.state.filter,
          [e.target.name]: e.target.value,
        },
      },
      () => {
        this.getUsersFromAPI();
      }
    );
  };

  render() {
    return (
      <section>
        <h1 className="headerTitle">{this.props.title || "User Database"}</h1>
        {Object.keys(this.state.filter).map((key, i) => (
          <div key={i} className="filterInput">
            <label>Filter by {key}</label>
            <input
              name={key}
              value={this.state.filter[key]}
              placeholder={`${key}`}
              type="text"
              onChange={this.updateFilter}
            />
          </div>
        ))}
        <br />
        <br />
        {this.state.users.map((user, index) => (
          <Collapsible key={index} title={user.name}>
            <button className="chat-button">Message</button>
            <UserToParagraph user={user} keys={this.state.keys} />
          </Collapsible>
        ))}
        <Pagination page={this.state.page} setPage={this.setPage} />
      </section>
    );
  }
}

Database.propTypes = {
  history: PropTypes.object.isRequired,
  title: PropTypes.object.isRequired,
};

export default Database;
