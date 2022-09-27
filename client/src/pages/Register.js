import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../actions/authActions";

import "./Login.css";

class Register extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      email: "",
      password: "",
      password2: "",
      errors: {},
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/edit");
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/edit");
    }

    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      });
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onRegister = (e) => {
    e.preventDefault();
    const userData = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2,
    };
    //checking database to see if credentials exist
    this.props.registerUser(userData);
  };

  render() {
    const { errors } = this.state;

    return (
      <section id="login">
        <form noValidate onSubmit={this.onRegister}>
          <div className="logo" />
          <hr />
          <label htmlFor="name">Name</label>
          <input
            onChange={this.onChange}
            value={this.state.name}
            id="name"
            type="name"
            placeholder="Enter your name"
          />
          <span className="error">
            {errors.name}
            {errors.namenotfound}
          </span>

          <label htmlFor="email">Email</label>
          <input
            onChange={this.onChange}
            value={this.state.email}
            id="email"
            type="email"
            placeholder="foo@bar.edu"
          />
          <span className="error">
            {errors.email}
            {errors.emailnotfound}
          </span>

          <label htmlFor="password">Password</label>
          <input
            onChange={this.onChange}
            value={this.state.password}
            id="password"
            type="password"
            placeholder="Password (at least 8 characters)"
          />
          <span className="error">
            {errors.password}
            {errors.passwordincorrect}
          </span>

          <label htmlFor="password2">Confirm password</label>
          <input
            onChange={this.onChange}
            value={this.state.password2}
            id="password2"
            type="password"
            placeholder="Reenter your password"
          />
          <span className="error">
            {errors.password2}
            {errors.password2incorrect}
          </span>
          <button type="submit">Register</button>
          <span className="error">{errors.status}</span>
        </form>
      </section>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  isLoading: state.auth.loading,
});

export default connect(mapStateToProps, { registerUser })(Register);
