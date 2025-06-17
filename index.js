import { app ,server} from "./src/app.js";
import dotenv from "dotenv";
import connectDb from "./src/config/db.config.js";

dotenv.config({ path: "./.env" });

// const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000;

app.on("error", (error) => {
  console.error("App Error:", error);
  throw error;
});

connectDb()
  .then(() => {
    server.listen(PORT,() => {

      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
