import axios from "axios";
import React, { Component } from "react"; 
import './Database.css';
import Collapsible from "../components/Collapsible";
import { UserToParagraph } from "../components/UserToParagraph";

const PaginationButton = ({ n, setPage }) => (
  n > 0
  // eslint-disable-next-line
  ? <a href="#" onClick={(e) => setPage(n, e)}>{n}</a>
  // eslint-disable-next-line
  : <a href="#" onClick={(e) => e.preventDefault()}> </a>
)

const Pagination = ({ page, setPage }) => (
  <p className='pagination'>
    {
      page >= 5
      ? 
      <div>
        <PaginationButton n={Math.max(page - 10, 1)} setPage={setPage} />
        <span>...</span>
      </div>
      : null
    }
    <PaginationButton n={page - 3} setPage={setPage} />
    <PaginationButton n={page - 2} setPage={setPage} />
    <PaginationButton n={page - 1} setPage={setPage} />
    <span>{page}</span>
    <PaginationButton n={page + 1} setPage={setPage} />
    <PaginationButton n={page + 2} setPage={setPage} />
    <PaginationButton n={page + 3} setPage={setPage} />
    <span>...</span>
    <PaginationButton n={page + 10} setPage={setPage} />
  </p>
)

class Database extends Component {
  constructor() {
    super();
    this.state = {
        users: [],
        limit: 8,
        keys: [],
        page: this.parsePageNumberHash(window.location.hash)
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
    axios.get(process.env.REACT_APP_API_URL + "/users/", { params: { limit: this.state.limit, page: this.state.page } }).then((res) => {
      console.log(res.data)
      if(res.data && res.data.page === this.state.page.toString()) {
        this.setState({
          users: res.data.users, 
          keys: Object.keys(res.data.users[0]).filter(this.filterOutNameKey)
        });
      }
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

  render() {
    return (
      <section>
        <h1 className="headerTitle">Database</h1>
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