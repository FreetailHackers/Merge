import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerUser } from "../actions/authActions";

class Register extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      email: "",
      password: "",
      password2: "",
      errors: {}
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Register page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };

    this.props.registerUser(newUser, this.props.history);
  };

  render() {
    const { errors } = this.state;

    return (
      <section>
        <h4>Register below</h4>
        <p>Already have an account? <Link to="/login">Log in</Link></p>
        <form noValidate onSubmit={this.onSubmit}>
          <div>
            <input
              onChange={this.onChange}
              value={this.state.name}
              error={errors.name}
              id="name"
              type="text"
            />
            <label htmlFor="name">Name</label>
            <span>{errors.name}</span>
          </div>
          <div>
            <input
              onChange={this.onChange}
              value={this.state.email}
              error={errors.email}
              id="email"
              type="email"
            />
            <label htmlFor="email">Email</label>
            <span>{errors.email}</span>
          </div>
          <div>
            <input
              onChange={this.onChange}
              value={this.state.password}
              error={errors.password}
              id="password"
              type="password"
            />
            <label htmlFor="password">Password</label>
            <span>{errors.password}</span>
          </div>
          <div>
            <input
              onChange={this.onChange}
              value={this.state.password2}
              error={errors.password2}
              id="password2"
              type="password"
            />
            <label htmlFor="password2">Confirm Password</label>
            <span>{errors.password2}</span>
          </div>
          <div>
            <button type="submit">Sign up</button>
          </div>
        </form>
      </section>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { registerUser }
)(withRouter(Register));
