import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import {db} from "../connection/connection.js"
import { createClient } from "redis";

const secretKey = process.env.SECRET_KEY;
const redisPwd=process.env.REDIS_PWD;
const client = createClient({
  password: redisPwd,
  socket: {
    host: "redis-14033.c100.us-east-1-4.ec2.cloud.redislabs.com",
    port: 14033,
  },
});
client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();
const showSubmissions = async (req, res) => {
  try {
    const cachedData = await client.get("submissions");
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    const sql = "SELECT * FROM submissions";
    db.query(sql, async (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ Message: "Error in fetching data" });
      }
      await client.set("submissions", JSON.stringify(result), "EX", 60 * 60); // 1 hour expiration

      return res.json(result);
    });
  } catch (error) {
    console.log(error);
    return res.json({ Message: "Server Side Error" });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM login WHERE email = ?";
  db.query(sql, [email], async (err, data) => {
    if (err) {
      console.log(err);
      return res.json({ Message: "Server Side Error" });
    }
    if (data.length > 0) {
      const match = await bcrypt.compare(password, data[0].password);
      if (match) {
        const name = data[0].name;
        const token = jwt.sign({ name }, secretKey, { expiresIn: "1d" });
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        return res.json({ Status: "Success" });
      } else {
        return res.json({ Message: "Incorrect password" });
      }
    }
    return res.json({ Message: "User doesn't exist" });
  });
};

// const hashPasswordAndInsert = async () => {
//   const hashedPassword = await bcrypt.hash("your_password", 10);
//   const sql = "INSERT INTO login (email, password, name) VALUES (?, ?, ?)";
//   db.query(
//     sql,
//     ["admin@gmail.com", hashedPassword, "admin"],
//     (err, results) => {
//       if (err) {
//         console.error(err);
//       } else {
//         console.log("User inserted");
//       }
//     }
//   );
// };
// hashPasswordAndInsert();
const submitCode=async(req,res)=>{
    const cachedData=await client.get("submissions");
    if(cachedData)
    {
      await client.del("submissions");
    }
    const{name,sourceCode,input,output,timestamp}=req.body;
    const sql = "INSERT INTO submissions (name, sourceCode, input, output, timestamp) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, sourceCode, input, output, timestamp], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({ Message: "Server Side Error" });
        }
        return res.json({ Status: "Success" });
    });
}


const checkAuth=(req,res)=>{
    
    return res.json({Status:"Success",name:req.name});
}

const logout=(req,res)=>{
    res.clearCookie('token');
    return res.json({Status:"Success"})
}
export { loginAdmin,submitCode ,showSubmissions ,checkAuth,logout};