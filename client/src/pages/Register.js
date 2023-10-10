import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function Register(props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (props.auth.userID) {
      navigate("/edit");
    }
  }, [props, navigate]);

  const onRegister = (e) => {
    e.preventDefault();
    const userData = {
      name: name,
      email: email,
      password: password,
      password2: password2,
    };
    //checking database to see if credentials exist
    props.registerUser(userData, setErrors);
  };

  function termsOfService() {
    const e = document.getElementById("termsofservice");
    e.style.display = "block";
  }

  function closeTOS() {
    const e = document.getElementById("termsofservice");
    e.style.display = "none";
  }

  const onBack = () => {
    navigate("/");
  };

  return (
    <section id="register">
      <div className="container-register">
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
          <button className="closetos" onClick={closeTOS}>
            Confirm
          </button>
        </div>

        <form noValidate onSubmit={onRegister}>
          <div className="logo" />
          <hr />
          <label htmlFor="name">Name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
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
            onChange={(e) => setEmail(e.target.value)}
            value={email}
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
            onChange={(e) => setPassword2(e.target.value)}
            value={password2}
            id="password2"
            type="password"
            placeholder="Reenter your password"
          />

          <span className="error">
            {errors.password2}
            {errors.password2incorrect}
          </span>
          <button type="submit">Register</button>
          <button type="submit" className="action" onClick={onBack}>
            Go Back
          </button>
          <span className="error">{errors.status}</span>
          <br />
          <br />
          <p id="ToS">
            <strong>By using Merge, you agree to our</strong>{" "}
            <a type="button" href="#termsofservice" onClick={termsOfService}>
              <strong>Terms of Service</strong>
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

export default Register;
