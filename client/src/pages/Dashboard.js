import React from "react";
import PropTypes from "prop-types";

function Dashboard(props) {
  //const name = props.user?.name;

  return (
    <section id="dashboard">
      <div className="dash">
        <h1>Help and Support</h1>
        {props.wideScreen && (
          <div>
            <div className="team-image">
              <div className="background" />
              <div className="main" />
              <div className="primary" />
              <div className="secondary" />
            </div>
          </div>
        )}
        <div className="forms">
          <div className="help">
            <p>
              For help and support please reach out to a Freetail organizer.
            </p>
          </div>
          <div className="links">
            <span>
              <a href="https://forms.gle/8351SySEuQ4R9A178">Feedback</a> for
              Merge is greatly appreciated as it is in early access!{" "}
            </span>
            <br /> <br />
            <span>
              Have any issues with inappropriate behavior? Please let us know
              using this{" "}
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSdpI2jA8BmbP9UUOEpXDMROCHFBeHO-Dy4V6lI7WKAs0y8eEg/viewform">
                Misconduct Form
              </a>
              .
            </span>
            <br /> <br />
            <span>
              Merge is hosted on{" "}
              <a href="https://gitlab.com/freetail-hackers/Merge">Gitlab</a>,
              with a read-only mirror on{" "}
              <a href="https://github.com/FreetailHackers/Merge">GitHub</a>
            </span>
            <br />
            <br />
            <span id="madewithlove">Made with ❤️ by Freetail Hackers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

Dashboard.propTypes = {
  user: PropTypes.object,
  wideScreen: PropTypes.bool,
};

export default Dashboard;
