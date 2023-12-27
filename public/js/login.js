  const login = async (email, password) => {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
        method: "post",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      }).then((e) => e.json());
      console.log(res);
      if (res.status === "success") {
        showAlert("success", "successfully logged!");
        window.setTimeout(() => {
          location.assign("/");
        }, 1500);
      } else if (res.status === "fail") {
        // Display the error message directly from data.message
        throw new Error(`${res.message}`);
      }
    } catch (err) {
      showAlert("error", "icorrect password or email");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    let loginForm = document.getElementById("form--login");

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      login(email, password);
    });

  });

  /////////
  const hideAlert = () => {
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
  };

  const showAlert = (type, msg) => {
    hideAlert();
    const marKUp = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", marKUp);
    window.setTimeout(hideAlert, 5000);
  };

  const logout = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/v1/users/logout", {
        method: "get",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
      }).then((e) => e.json());
      console.log(res);
      if (res.status === "success") {
        location.reload(true);
      } else {
        // Display the error message directly from data.message
        throw new Error(`${res.message}`);
      }
    } catch (err) {
      showAlert("error", "error in logout");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const logoutbtn = document.querySelector(".nav__el--logout");
    if (logoutbtn) logoutbtn.addEventListener("click", logout);
  });

  ///update userdata name mail

  const updateUserData = async (name, email) => {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/v1/users/updateMe", {
        method: "PATCH",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
        }),
      }).then((e) => e.json());

      console.log(res);
      if (res.status === "success") {
        showAlert("success", "Successfully Updated");
      } else {
        // Display the error message directly from data.message
        throw new Error(`${res.message}`);
      }
    } catch (err) {
      showAlert("error", "Something went wrong");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    let updatedUserForm = document.querySelector(".form-user-data");

    updatedUserForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const name = document.getElementById("name").value;
      updateUserData(name, email);
    });
    updatedUserForm = null;
  });

  const updateUserpassword = async (
    passwordCurrent,
    password,
    confirmPassword
  ) => {
    try {
      // Validate input
      if (
        typeof password !== "string" ||
        typeof passwordCurrent !== "string" ||
        typeof confirmPassword !== "string"
      ) {
        showAlert(
          "error",
          "Invalid input. Please provide valid strings for password, passwordCurrent, and confirmPassword."
        );
        return;
      }

      const res = await fetch(
        "http://127.0.0.1:3000/api/v1/users/updateMyPassword",
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            passwordCurrent: passwordCurrent,
            password: password,
            confirmPassword: confirmPassword,
          }),
        }
      );

      const result = await res.json();

      console.log(result);

      if (result.status === "success") {
        showAlert("success", "Successfully Updated");
      } else {
        // Display the error message directly from result.message
        throw new Error(`${result.message}`);
      }
    } catch (err) {
      showAlert("error", "Something went wrong");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    let updatedPasswordForm = document.querySelector(".form-user-settings");

    updatedPasswordForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const passwordCurrent = document.getElementById("password-current").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("password-confirm");
      updateUserpassword(passwordCurrent, password, confirmPassword);
    });
  });

  //-     // JavaScript to handle Razorpay payment initiation
  const paymentfn = async (tourId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
      );
      const data = await response.json();

      console.log("Server Response:", data);

      // Initialize Razorpay checkout
      const options = {
        key: "rzp_test_fKABEuZrHuQRoB", // Replace with your Razorpay key
        amount: data.amount,
        currency: data.currency,
        name: "Your Tour Name",
        description: "Tour Booking",
        order_id: data.orderId,

        handler: function (response) {
          console.log(response.razorpay_payment_id);
          console.log(response.razorpay_order_id);
          console.log(response.razorpay_signature);
        },
        prefill: {
          name: "User Name",
          email: "user@email.com",
          contact: "1234567890",
        },
      };

      console.log(options);

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
      });

      setTimeout(() => rzp.open(), 1000);
    } catch (error) {
      showAlert("error", "Error initiating payment");
      console.log(error);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    let paymentbtn = document.getElementById("book-tour");
    if (paymentbtn) {
      var tourId = paymentbtn.dataset.tourId;
    }

    paymentbtn.addEventListener("click", (event) => {
      paymentfn(tourId);
      event.preventDefault();
    });
  });
