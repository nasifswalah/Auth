import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js";
import { mailTrapClient, sender } from "./mailtrap.config.js";

// Functionalities for send verification email
export const sendVerificationEmail = (email, verificationToken) => {
    const recepient = [{ email }];

    try {
        // Send email
        const response = mailTrapClient.send({
            from: sender,
            to: recepient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verfication"
        });

        console.log(`Email send successfully: ${response}`)
    } catch (error) {
        console.log(`Error sending verification email : ${error}`);

        throw new Error(`Failed to send verification email : ${error}`);
    };
};

// Functionalities for send welcome email
export const sendWelcomeEmail = (email, name) => {
    const recepient = [{ email }];

    try {
        // Send email
        const response = mailTrapClient.send({
            from: sender,
            to: recepient,
            template_uuid: "af174d14-d709-4873-a602-436894c2f3d3",
            template_variables: {
                "company_info_name": "Test App",
                "name": name
            }
        });

        console.log(`Welcome email send successfully: ${response}`);
    } catch (error) {
        console.log(`Failed to send welcome email: ${error}`);
        throw new Error(`Error sending welcome email: ${error}`);
    };
};

// Functionalities for send password reset link
export const sendPasswordResetEmail = (email, resetUrl) => {
    const recepient = [{email}];

    try {
        // Send email
        const response = mailTrapClient.send({
            from:sender,
            to:recepient,
            subject:"Reset Password",
            html:PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL', resetUrl),
            category:"Reset Request"
        });

        console.log(`Reset link shared to your email: ${response}`);
    } catch (error) {
        console.log(`Error sending reset link: ${error}`);
        throw new Error(`Error in sending reset link: ${error}`);
    };
};