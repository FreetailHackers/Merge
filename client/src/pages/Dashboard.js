import React from "react";
import PropTypes from "prop-types";

function Dashboard(props) {
  const name = props.user?.name;

  return (
    <>
      <section id="dashboard">
        <div className="dash">
          <h1>Welcome home{name ? `, ${name}` : `!`}</h1>
          <p>Start finding your hackathon team members!</p>
          <div>
            <div className="team-image">
              <div className="background" />
              <div className="main" />
              <div className="primary" />
              <div className="secondary" />
            </div>
          </div>
          <div className="forms">
            <div className="help">
              <h1>Help and Support</h1>
              <p>
                For help and support please reach out to a Freetail organizer.
              </p>
            </div>
            <div className="links">
              <span>
                <a href="https://forms.gle/ixKqxd8w9gmeGAYV6">Feedback</a> for
                Merge is greatly appreciated as it is in early access!{" "}
              </span>
              <br /> <br />
              <span>
                Have any issues with inappropriate behavior? Please let us know
                using this{" "}
                <a href="freetailhackers.com/htf-report">Misconduct Form</a>.
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
              <br className="mobile-nav-space" />
              <br className="mobile-nav-space" />
              <br className="mobile-nav-space" />
              <br className="mobile-nav-space" />
              <br className="mobile-nav-space" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Dashboard.propTypes = {
  user: PropTypes.object,
  wideScreen: PropTypes.bool,
  flipDisplaySidebar: PropTypes.func,
};

export default Dashboard;
