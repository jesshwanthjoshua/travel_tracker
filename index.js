import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "Family14!$",
  host: "localhost",
  database: "world",
  port: 5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


let visited_countries = [];

 
app.get("/", async (req, res) => {
  //Write your code here.

  const result = await db.query("SELECT * FROM visited_countries");
  console.log(result.rows);
  
  result.rows.forEach((row) => {
    if (visited_countries.includes(row.country_code)){
      return;
    }
    else{
      visited_countries.push(row.country_code);
      console.log(row);
      // console.log(row.country_code);
      // console.log(countries);
    }
  });
   
  res.render("index.ejs", {countries: visited_countries, total: visited_countries.length});
  console.log("visited_countries: ", visited_countries);
  console.log("visited_countries_count: ", visited_countries.length);
});

app.post("/add", async(req, res) => {
  console.log(req.body);

  let country_name = req.body.country;
  console.log(country_name);

  let country_code = "";
  let country_found = false;
  let country_already_exist = false;
  let error;

  // const result = await db.query("SELECT * FROM countries");
  // console.log(result.rows);

  const result = await db.query("SELECT * FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' ", [country_name.toLowerCase()]);
  console.log("result: ", result.rows);
  
  const first_data = result.rows[0];
    
  // result.rows[0].forEach((row) => {
  // if (row.country_name.toLowerCase() === country_name.toLowerCase()){
  country_name = first_data.country_name;
  country_code = first_data.country_code;
  country_found = true;
  console.log("Country Found: "+ country_found);
  console.log("Country Code: "+ country_code);

  if(visited_countries.includes(country_code)){
    country_already_exist = true;
    error = "Country has already been added, try again";
    console.log("Country Already Exists: "+ country_already_exist);
    // return;
  }else{
    visited_countries.push(country_code);
    console.log("visited countries after push: ", visited_countries);
    console.log("visited countries count after push: ", visited_countries.length);
    db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[country_code]);
  }
  console.log("country_code: ", country_code);
  console.log("country_code: ", first_data.country_code);
  console.log("country_name: ", country_name);
  console.log("country_name: ", first_data.country_name);

  // }}

  if (country_found == false){
      error = "Country name does not exist, try again";
  }

  console.log("country_code outside_loop: ", country_code);
  console.log("country_name outside_loop: ", country_name);
  console.log("visited_countries outside post loop: ", visited_countries);
  console.log("visited_countries_count outside post loop: ", visited_countries.length);
  console.log("Error: ", error);

  res.render("index.ejs", {countries: visited_countries, total: visited_countries.length, error: error});
  console.log("visited_countries: ", visited_countries);
  console.log("visited_countries_count: ", visited_countries.length);
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
