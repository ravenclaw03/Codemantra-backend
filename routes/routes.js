import express from "express";
const router = express.Router();
import { loginAdmin,submitCode ,showSubmissions ,checkAuth,logout} from "../controllers/routesController.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const secretKey = process.env.SECRET_KEY;

const verifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Message: "You are not Authorised!" });
  } else {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.json({ Message: "Authentication Error" });
      } else {
        req.name = decoded.name;
        next();
      }
    });
  }
};

 router.post("/login", loginAdmin);
 router.post("/submit",submitCode);
 router.get("/submissions",showSubmissions);
 router.get("/check",verifyUser,checkAuth);
  router.get("/logout", logout);

export default router;