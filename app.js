const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
app.use(express.json());

const dbpath = path.join(__dirname, "userData.db");

let db = null;

const intilizeserverandDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully..");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

intilizeserverandDB();

// Api 1

app.post("/register", async (request, response) => {
  const userdetails = request.body;
  const { username, password, name, gender, location } = userdetails;

  const query1 = `SELECT * FROM user WHERE username='${username}';`;
  const array1 = await db.get(query1);

  if (array1 === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      hasedpassword = await bcrypt.hash(password, 10);
      query2 = `INSERT INTO user(username,name,password,gender,location) VALUES(
          '${username}',
          '${name}',
          '${hasedpassword}',
          '${gender}',
          '${location}'
      );`;
      const array2 = await db.run(query2);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

// Api 2

app.post("/login", async (request, response) => {
  const userdetails = request.body;
  const { username, password } = userdetails;

  query1 = `SELECT * FROM user WHERE username = '${username}';`;
  array1 = await db.get(query1);
  if (array1 !== undefined) {
    const ispassword = await bcrypt.compare(password, array1.password);
    if (ispassword) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});

// Api 3

app.put("/change-password", async (request, response) => {
  const userdetails = request.body;
  const { username, oldPassword, newPassword } = userdetails;

  query1 = `SELECT * FROM user WHERE username='${username}';`;
  array1 = await db.get(query1);

  if (array1 !== undefined) {
    const ispassword = await bcrypt.compare(oldPassword, array1.password);

    if (ispassword) {
      if (newPassword.length < 5) {
        response.status(400);
        response.send("Password is too short");
      } else {
        const hashedpassword = await bcrypt.hash(newPassword, 10);
        const query2 = `UPDATE user
      SET 
      password = '${hashedpassword}'
      WHERE username = '${username}';`;
        array2 = await db.run(query2);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
