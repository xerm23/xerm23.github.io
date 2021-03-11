

const contactForm = document.querySelector(".contact-form");
// Listen for a submit
contactForm.addEventListener("submit", submitForm);

function submitForm(e){
    e.preventDefault();    
    // Get input values
    let email = document.querySelector("#contactMail").value;
    let message = document.querySelector("#mailText").value;

    sendEmail(email, message);
    contactForm.reset();
}   


function sendEmail(email, message){
    Email.send({
        SecureToken: "ecc1cbe7-d733-4986-8163-76f6be2dc6aa",
        To: "m.radeljic43@gmail.com",
        From: "m.radeljic43@gmail.com",
        Subject: `Someone sent you a message on your website!`,
        Body: `Email: ${email} <br/> Message: ${message}`,
    }).then(
        (message) => alert("Your message has been sent!")
    );



}



