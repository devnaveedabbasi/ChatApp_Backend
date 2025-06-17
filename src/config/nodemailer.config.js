import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "naveedabbasi03111309060@gmail.com",
    pass: "sltjlahkmhkgmtyz",
  },
});

export default transporter

