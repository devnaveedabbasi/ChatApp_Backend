import { Reset_Password_Email_Template, Verification_Email_Template, Welcome_Email_Template } from "../config/emailTemplete.config.js";
import transporter from "../config/nodemailer.config.js";


 const sendVerificationCode=async(email,verificationCode)=>{
  try {
   const response=   await transporter.sendMail({
          from: '"Naveed" <naveedabbasi03111309060@gmail.com>',
          to: email, // list of receivers
          subject: "Verify your Email", // Subject line
          text: "Verify your Email", // plain text body
          html: Verification_Email_Template.replace("{verificationCode}",verificationCode)
      })
  } catch (error) {
      console.log('Email error',error)
  }
}


const wellcomeEmail=async(email,name)=>{
    try {
     const response=   await transporter.sendMail({
            from: '"Naveed" <naveedabbasi03111309060@gmail.com>',
            to: email, // list of receivers
            subject: "Welcome to Our Community!", // Subject line
            text: "Welcome to Our Community!", // plain text body
            html: Welcome_Email_Template.replace("{name}",name)
        })
    } catch (error) {
        console.log('Email error',error)
    }
}

const sendResetPasswordEmail = async (email, resetLink) => {
    try {
      const response = await transporter.sendMail({
        from: '"Naveed" <naveedabbasi03111309060@gmail.com>',
        to: email,
        subject: "Reset your password",
        text: "Reset your password",
        html: Reset_Password_Email_Template.replace("{resetLink}", resetLink),
      });
      console.log("Reset Password Email sent successfully", response);
    } catch (error) {
      console.log("Email error", error);
    }
  };
  


  export  {wellcomeEmail,sendVerificationCode,sendResetPasswordEmail};
