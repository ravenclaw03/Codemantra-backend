import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config";
import routes from "./routes/routes.js"
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use("",routes);
const PORT =process.env.PORT || 4000;
app.listen(PORT,()=>{
    console.log("Server started")
})