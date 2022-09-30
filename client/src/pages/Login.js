import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser, registerUser } from "../actions/authActions";

import "./Login.css";

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errors: {},
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
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

  onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email: this.state.email,
      password: this.state.password,
    };
    //checking database to see if credentials exist
    this.props.loginUser(userData);
  };

  onRegister = (e) => {
    this.props.history.push("/register");
  };
  render() {
    const { errors } = this.state;

    return (
      <section id="login">
        <form id="fields">
          <div className="logo" />
          <hr />
          <label htmlFor="email">Email</label>
          <input
            onChange={this.onChange}
            value={this.state.email}
            //error={errors.email}
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
            //error={errors.password}
            id="password"
            type="password"
            placeholder="Password (at least 8 characters)"
          />
          <span className="error">
            {errors.password}
            {errors.passwordincorrect}
          </span>

          <button onClick={this.onSubmit} className="action" type="submit">
            Login
          </button>
          <span className="error">{errors.status}</span>
          <button onClick={this.onRegister} className="action" type="submit">
            Register
          </button>
        </form>
      </section>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { loginUser, registerUser })(Login);
