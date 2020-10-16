import React, { memo, useEffect, useState } from "react";
import "./styles.css";
const Login = memo(() => {
  const [isLoginView, setIsLoginView] = useState(true);
  useEffect(() => {
    document.title = "Đăng nhập";
  }, []);
  return (
    <div className="d-flex justify-content-center">
      <div id="logreg-forms">
        <form className="form-signin">
          <h1
            className="h3 mb-3 font-weight-normal"
            style={{ textAlign: "center" }}
          >
            {" "}
            Sign in
          </h1>
          <input
            type="email"
            id="inputEmail"
            className="form-control"
            placeholder="Email address"
            required
            autofocus
          />
          <input
            type="password"
            id="inputPassword"
            className="form-control"
            placeholder="Password"
            required
          />
          <button className="btn btn-success btn-block" type="submit">
            <i className="fas fa-sign-in-alt" /> Sign in
          </button>
          <a href="#" id="forgot_pswd">
            Forgot password?
          </a>
          <hr />
          {/* <p>Don't have an account!</p>  */}
          <button
            className="btn btn-primary btn-block"
            type="button"
            id="btn-signup"
          >
            <i className="fas fa-user-plus" /> Sign up New Account
          </button>
        </form>
        <form action="/reset/password/" className="form-reset">
          <input
            type="email"
            id="resetEmail"
            className="form-control"
            placeholder="Email address"
            required
            autofocus
          />
          <button className="btn btn-primary btn-block" type="submit">
            Reset Password
          </button>
          <a href="#" id="cancel_reset">
            <i className="fas fa-angle-left" /> Back
          </a>
        </form>
        <form action="/signup/" className="form-signup">
          <div className="social-login">
            <button className="btn facebook-btn social-btn" type="button">
              <span>
                <i className="fab fa-facebook-f" /> Sign up with Facebook
              </span>{" "}
            </button>
          </div>
          <div className="social-login">
            <button className="btn google-btn social-btn" type="button">
              <span>
                <i className="fab fa-google-plus-g" /> Sign up with Google+
              </span>{" "}
            </button>
          </div>
          <p style={{ textAlign: "center" }}>OR</p>
          <input
            type="text"
            id="user-name"
            className="form-control"
            placeholder="Full name"
            required
            autofocus
          />
          <input
            type="email"
            id="user-email"
            className="form-control"
            placeholder="Email address"
            required
            autofocus
          />
          <input
            type="password"
            id="user-pass"
            className="form-control"
            placeholder="Password"
            required
            autofocus
          />
          <input
            type="password"
            id="user-repeatpass"
            className="form-control"
            placeholder="Repeat Password"
            required
            autofocus
          />
          <button className="btn btn-primary btn-block" type="submit">
            <i className="fas fa-user-plus" /> Sign Up
          </button>
          <a href="#" id="cancel_signup">
            <i className="fas fa-angle-left" /> Back
          </a>
        </form>
        <br />
      </div>
      <p style={{ textAlign: "center" }}>
        <a
          href="http://bit.ly/2RjWFMfunction toggleResetPswd(e){
    e.preventDefault();
    $('#logreg-forms .form-signin').toggle() // display:block or none
    $('#logreg-forms .form-reset').toggle() // display:block or none
}

function toggleSignUp(e){
    e.preventDefault();
    $('#logreg-forms .form-signin').toggle(); // display:block or none
    $('#logreg-forms .form-signup').toggle(); // display:block or none
}

$(()=>{
    // Login Register Form
    $('#logreg-forms #forgot_pswd').click(toggleResetPswd);
    $('#logreg-forms #cancel_reset').click(toggleResetPswd);
    $('#logreg-forms #btn-signup').click(toggleSignUp);
    $('#logreg-forms #cancel_signup').click(toggleSignUp);
})g"
          target="_blank"
          style={{ color: "black" }}
        ></a>
      </p>
    </div>
  );
});

export default Login;
