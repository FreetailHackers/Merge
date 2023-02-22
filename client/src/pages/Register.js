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

  termsOfService() {
    const e = document.getElementById("termsofservice");
    e.style.display = "block";
  }

  closeTOS() {
    const e = document.getElementById("termsofservice");
    e.style.display = "none";
  }

  onBack = () => {
    this.props.history.push("/");
  };

  render() {
    const { errors } = this.state;

    return (
      <section id="register">
        <div className="terms" id="termsofservice">
          <strong>Terms of Service</strong>
          <ol type="1">
            <li>
              Follow the{" "}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
              >
                MLH Code of Conduct.
              </a>
            </li>
            <li>Use your real name in your profile.</li>
            <li>Avoid using slurs or offensive sentiments.</li>
            <li>Avoid pretending to be a organizer/mentor/sponsor.</li>
            <li>
              Do not provide or request help on projects that may break laws,
              breach terms of services, be considered malicious /inappropriate
              or be for graded coursework/exams.
            </li>
            <li>
              Freetail Hackers reserves the right to take action against any
              harmful behavior not necessarily outlined here.
            </li>
          </ol>
          <button className="closetos" onClick={this.closeTOS}>
            Confirm
          </button>
        </div>

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
          <button type="submit" className="action" onClick={this.onBack}>
            Go Back
          </button>
          <span className="error">{errors.status}</span>
          <br />
          <br />
          <p id="ToS">
            <strong>By using Merge, you agree to our</strong>{" "}
            <a
              type="button"
              href="#termsofservice"
              onClick={this.termsOfService}
            >
              <strong>Terms of Service</strong>
            </a>
          </p>
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
