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

let visited_countries_code = [];


async function visitedCountries(){
  const result = await db.query("SELECT country_code, country_name FROM visited_countries");
  console.log("result rows: ", result.rows);
  result.rows.forEach((row) => {
    if (visited_countries_code.includes(row.country_code) === false)
          visited_countries_code.push(row.country_code);
  })
  return visited_countries_code;
}
 
app.get("/", async (req, res) => {
  //Write your code here.

  let visited_countries = await visitedCountries();
  console.log("visited_countries: ", visited_countries);
  console.log("visited_countries_count: ", visited_countries.length);
     
  res.render("index.ejs", {countries: visited_countries, total: visited_countries.length});

});

app.post("/add", async(req, res) => {
  console.log(req.body);
  let country_name = req.body.country;
  console.log(country_name);
  
  try{ 
      const result = await db.query("SELECT country_code,country_name FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",[country_name.toLowerCase()]);
      
      console.log("result: ",result.rows);

      const data = result.rows[0];
      console.log("data: ", data);

      let country_code = data.country_code;
      country_name = data.country_name;
      console.log("country code: ", country_code);
      console.log("country code: ", country_name);

      try{
        await db.query(
          "INSERT INTO visited_countries(country_code, country_name) VALUES ($1, $2)",[country_code, country_name]);
        
        res.redirect("/");

      } catch (err){
        console.log(err);
        let visited_countries = await visitedCountries();
        res.render("index.ejs", {
          countries: visited_countries,
          total: visited_countries.length,
          error: "Country has already been added, try again.",
        });
      }

  } catch(err){
    console.log(err);
    let visited_countries = await visitedCountries();
     
    res.render("index.ejs", {
      countries: visited_countries,
      total: visited_countries.length,
      error: "Country name does not exist, try again."
    });
  }

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
