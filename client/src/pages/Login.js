import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";

function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (props.auth.userID) {
      navigate("/swipe");
    }
  }, [props, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email: email,
      password: password,
    };
    //checking database to see if credentials exist
    props.loginUser(userData, setErrors);
  };

  return (
    <section id="login">
      <div className="container">
        <form id="fields">
          <div className="logo" />
          <label htmlFor="email">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
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
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            //error={errors.password}
            id="password"
            type="password"
            placeholder="Password (at least 8 characters)"
          />
          <span className="error">
            {errors.password}
            {errors.passwordincorrect}
          </span>

          <button onClick={onSubmit} className="action" type="submit">
            Log in
          </button>
          <span className="error">{errors.status}</span>
          <p>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="reg-login-nav">
              {" "}
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

export default Login;
