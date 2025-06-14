let express=require('express');
const path=require('path'); 
const app = express();
const methodOverride = require('method-override')
app.set('view engine','ejs');
const engine=require('ejs-mate');
app.engine('ejs', engine);
app.use(methodOverride('_method'))
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: true}))
app.use(express.json());
const expressError=require("./utils/expressError.js");
const nodemailer = require("nodemailer");

// Use environment variables with fallbacks
const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'shekhawat';
const DB_NAME = process.env.DB_NAME || 'expense_tracker';
const DB_NAME_EXPENSES = process.env.DB_NAME_EXPENSES || 'expenses';
const DB_NAME_SETTLEMENTS = process.env.DB_NAME_SETTLEMENTS || 'ChippinSettlements';
const EMAIL_USER = process.env.EMAIL_USER || 'customdomain.08@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'tone nper jpig bfgc';
const DB_PORT = process.env.DB_PORT || 3306;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

const mysql = require('mysql2');
const { verify } = require('crypto');
const { create } = require('domain');

function code_generator (){
    return Math.floor(Math.random()*1000000 + 1);
}

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT
});

const expenses = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME_EXPENSES,
    password: DB_PASSWORD,
    port: DB_PORT
});

const Settlementconnection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME_SETTLEMENTS,
    password: DB_PASSWORD,
    port: DB_PORT
});

let new_f=true;
let i_user=false;
let i_pass=false;

const emailVerification = (to,from,subject,html)=>{
    async function main(){
        const info = await transporter.sendMail({
            from : `"Chippin - Your only Expense Tracker" <${from}>`,
            to:   `${to}`,
            subject: `${subject}`,
            html: `Welcome to Chipping! 👋 <br><br></br></br>We're so excited to have you on board.
             Chipping makes it easy to track shared expenses, split bills fairly, and settle up with friends effortlessly whether you're managing rent with roommates, splitting a dinner bill, or organizing a group trip.
             Please find the Attach code to activate your account <b>${code}</b>. <br></br><br></br> Happy Sharing 😄`
        });
    }
    main().catch(console.err);
}
app.get('/login',(req,res)=>{
    res.render('./Login/user_login.ejs',{message: "Login to your Account"});
})
let userEntered;
let userEntered_ID;
let userEntered_uname;
app.post('/login',(req,res)=>{
    let {username,password} = req.body;
    let q='Select user_id,name,username,password from user';
    connection.query(q,(err,result)=>{
        if(err) {
            console.error("Database error:", err);
            return res.render('./Login/user_login.ejs',{message: "An error occurred during login"});
        }
        
        let userFound = false;
        for(let user of result){
            if(user.username === username){
                userFound = true;
                if(user.password === password){
                    new_f = true;
                    userEntered_uname = user.username;
                    userEntered = user.name;
                    userEntered_ID = user.user_id;  
                    return res.redirect('/home');
                } else {
                    return res.render('./Login/user_login.ejs',{message: "Invalid Password"});
                }
            }
        }
        
        if(!userFound) {
            return res.render('./Login/user_login.ejs',{message: "User does not Exist"});
        }
    });
})
app.get('/create',(req,res)=>{
    res.render('./Login/register.ejs',{message: null});
})
let u_email;
let new_user=[];
app.post('/create',(req,res)=>{
    let {name,username,password,email,pno}=req.body;
    new_user=[name,username,password,email,pno];
    u_email=email;
    res.redirect('/create_s');
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

let ef_code;
let wrong_flag=false;
app.get('/create_s',(req,res)=>{
    async function main(){
        let e_code=code_generator();
        ef_code=e_code;
        const info = await transporter.sendMail({
            from:'"Chippin - Your only Expense Tracker " <customdomain.08@gmail.com',
            to: `${u_email}`,
            subject: "🎉 Welcome to Chipping - Let's Split Smarter!",
            html: `Welcome to Chipping! 👋 <br><br></br></br>We're so excited to have you on board.
                 Chipping makes it easy to track shared expenses, split bills fairly, and settle up with friends effortlessly whether you're managing rent with roommates, splitting a dinner bill, or organizing a group trip.
                 Please find the Attach code to activate your account <b>${e_code}</b>. <br></br><br></br> Happy Sharing 😄`

        })
    }
    main().catch(console.err);
    res.render('./Login/new_account_verification',{wrong_flag});
})

app.post("/create_s",(req,res)=>{
    let {i_code}=req.body;  
    if(i_code == ef_code){
        let q='insert into user (name,username,password,email,phone_number) values (?)';
        connection.query(q,[new_user],(err,result)=>{
            if(err) {
                if(err.errno === 1062) {
                    return res.render('./Login/register.ejs',{message: " ❌ Username Already Exists"});
                }
                return res.status(500).render('./Login/register.ejs',{message: "An error occurred while creating your account"});
            }
            res.redirect('/login');
        });
    }
    else{
        wrong_flag=true;
        res.render('./Login/new_account_verification.ejs',{wrong_flag});
    }
})


let code;
let user_forgot_email=[];
app.route("/forgot")
.get((req,res)=>{
    res.render('./Login/request_email_reset.ejs',{flag: false});
})
.post((req,res,next)=>{
    let {input}=req.body;
    let q='select email from user where username = (?) or phone_number = (?) or email = (?)';
    connection.query(q,[input,input,input],(err,result)=>{
        if(err){
            return next(new expressError(400, "Invalid Entry! Try Again"));
        }
        if(result.length==0){
            return next(new expressError(400, "Invalid Entry! Try Again"));
        }
        async function main(){
            let v_code=code_generator();
            code=v_code;
            user_forgot_email.push(result[0].email);
            const info = await transporter.sendMail({
                from : '"Chippin - Your only Expense Tracker" <angeline18@ethereal.email>',
                to:   `${result[0].email}`,
                subject: "Reset Your Chipping Password",
                html: `We've received a request to reset your Chipping password.
                Please follow the instructions below to proceed:<br></br><br></br>
                
                🔐 Reset Code: ${v_code} <br></br>
                ➡️ Enter this code in the password reset page.<br></br>
                🆕 Create a new password of your choice. <br></br>
                ✅ Once done, log in again with your new credentials.
                
                <br></br><br></br>
                Happy Sharing! 😄 <br></br>
                — The Chippin Team`
            });
        }
        main().catch(console.err);
        res.redirect("/verify_email");
    });
})

app.use("/forgot",(err,req,res,next)=>{
    const {message, status} = err;
    res.status(status).render("./Login/request_email_reset.ejs", {error: message,flag: true});
})
app.route("/verify_email",(wrong_flag = false)).get((req,res)=>{
    res.render("./Login/verify_email_reset.ejs",{wrong_flag});

}).post((req,res)=>{
    let {i_code} = req.body;
    if(i_code == code){
        res.redirect('/new_password')
    }
    else{
        wrong_flag = true;
        res.render('./Login/verify_email_reset',{wrong_flag});
    }
})
app.route("/new_password",(wrongp_flag=false,next_flag=false))
.get((req,res)=>{
    res.render('./Login/new_password_request.ejs',{wrongp_flag,next_flag});
})
.post((req,res)=>{
    let {new_pass,confirm_pass}=req.body;
    if(new_pass !== confirm_pass){
        wrongp_flag = true;
        res.render('./Login/new_password_request.ejs',{wrongp_flag,next_flag});
    }
    else{
        let q = 'update user set password = (?) where email = (?)';
        connection.query(q,[new_pass,user_forgot_email[0]],(err,result)=>{
            if(err) throw err;
            next_flag =true;
            res.render('./Login/new_password_request.ejs',{wrongp_flag,next_flag});
        }) 
    }

})

let arr=[];
let arr_name=[];
app.route("/home")
  .get((req, res) => {
        res.render("./Home/Home-page.ejs", {userEntered,title: "Chippin - Home",});
    });
app.route("/Settings")
.get((req,res)=>{
    let q="select name,username,email,phone_number,password from user where name = (?)";
    let resultDetails=[]
    connection.query(q,[userEntered],(err,result)=>{
        if(err){
            return err;
        }
        res.render("./Settings/settings.ejs",{result});
    })
})
app.use("/Profile/Update",(req,res,next)=>{
    let {grant}=req.query;
    if(grant=="accessgranted"){
        next();
    }
    else{
        res.render("./InvalidAccess/unauthorized.ejs");
    }
})
app.route("/Profile/Update")
.get((req,res)=>{
    let q="select name,username,email,phone_number,password from user where name = (?)";
    connection.query(q,[userEntered],(err,result)=>{
        if(err){
            console.error("Error fetching user data:", err);
            return res.status(500).send("Error fetching user data");
        }
        if(!result || result.length === 0) {
            return res.status(404).send("User not found");
        }
        res.render("./Settings/Update.ejs",{result: result[0]});
    })
})
.post((req,res)=>{
    let q="select name,username,email,phone_number,password from user where name = (?)";
    connection.query(q,[userEntered],(err,result)=>{
        if(err){
            console.error("Error fetching user data:", err);
            return res.status(500).send("Error fetching user data");
        }
        if(!result || result.length === 0) {
            return res.status(404).send("User not found");
        }
        res.render("./Settings/Update.ejs",{result: result[0]});
    })
})
app.use("/ProfileUpdate",(req,res,next)=>{
    let {status}=req.query;
    if(status=="successfull"){
        next();
    }
    else{
        res.render("./InvalidAccess/unauthorized.ejs");
    }
})
app.route("/ProfileUpdated")
.post((req,res)=>{
    let {name,username,password,email,pno}=req.body;
    let q="update user set name=(?),username=(?),email=(?),password=(?),phone_number=(?) where name=(?)";
    connection.query(q,[name,username,email,password,pno,userEntered],(err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/Settings");
        }
    })
})
const title_friends = "Chippin - Friends";
let path_friends = "./Friends-Styles/home.css";


let checkFriendcard=false;
app.route("/Friends")
  .get((req, res) => {
    path_friends = "./Friends-Styles/home.css";
    const q2 = 'SELECT DISTINCT friend_name, friend_table_name FROM friendsLinked WHERE userid = ? AND friend_name IS NOT NULL';
    connection.query(q2, [userEntered_ID], (err, resu) => {
      if (err) {
        console.error("Error fetching friends:", err);
        return res.status(500).send("Error fetching friends");
      }
      res.render("./Friends/home.ejs", {
        title_friends,
        path_friends,
        message: null,
        resu: resu || []
      });
    });
  })
  .post((req, res) => {
    const { username } = req.body;
    const q = 'SELECT user_id, name, username FROM user WHERE username = ?';
    connection.query(q, [username], (err, result) => {
      if (err || result.length === 0) {
        const q2 = 'SELECT DISTINCT friend_name, friend_table_name FROM friendsLinked WHERE userid = ? AND friend_name IS NOT NULL';
        connection.query(q2, [userEntered_ID], (err, resu) => {
          if (err) {
            console.error("Error fetching friends:", err);
            return res.status(500).send("Error fetching friends");
          }
          res.render("./Friends/home.ejs", {
            title_friends,
            path_friends,
            message: "User not found! Please check the username and try again.",
            resu: resu || []
          });
        });
      } else {
        const checkFriend = 'SELECT * FROM friendsLinked WHERE userid = ? AND friend_table_name = ?';
        connection.query(checkFriend, [userEntered_ID, username], (err, existingFriend) => {
          if (err) {
            console.error("Error checking friend:", err);
            return res.status(500).send("Error checking friend");
          }

          if (existingFriend.length > 0) {
            const q2 = 'SELECT DISTINCT friend_name, friend_table_name FROM friendsLinked WHERE userid = ? AND friend_name IS NOT NULL';
            connection.query(q2, [userEntered_ID], (err, resu) => {
              if (err) {
                console.error("Error fetching friends:", err);
                return res.status(500).send("Error fetching friends");
              }
              res.render("./Friends/home.ejs", {
                title_friends,
                path_friends,
                message: "Friend already exists in your list! Check for different user",
                resu: resu || []
              });
            });
            return;
          }

          const q1 = `CREATE TABLE IF NOT EXISTS ${username} (id int primary key auto_increment, lender varchar(200), borrower varchar(200), amount float, description varchar(300), dateadded varchar(100), currency varchar(5), settlement_option varchar(5))`;
          Settlementconnection.query(q1, (err) => {
            if (err && err.errno !== 1050) {
              console.error("Error creating table:", err);
              return res.status(500).send("Error creating table");
            }

            // Create table for current user if it doesn't exist
            const q1_current = `CREATE TABLE IF NOT EXISTS ${userEntered_uname} (id int primary key auto_increment, lender varchar(200), borrower varchar(200), amount float, description varchar(300), dateadded varchar(100), currency varchar(5), settlement_option varchar(5))`;
            Settlementconnection.query(q1_current, (err) => {
              if (err && err.errno !== 1050) {
                console.error("Error creating current user table:", err);
                return res.status(500).send("Error creating current user table");
              }

              const q2 = 'INSERT INTO friendsLinked(userid, friend_name, friend_table_name) VALUES (?, ?, ?)';
              connection.query(q2, [userEntered_ID, result[0].name, username], (err) => {
                if (err) {
                  console.error("Error adding friend:", err);
                  return res.status(500).send("Error adding friend");
                }

                const q3 = 'INSERT INTO friendsLinked(userid, friend_name, friend_table_name) VALUES (?, ?, ?)';
                connection.query(q3, [result[0].user_id, userEntered, userEntered_uname], (err) => {
                  if (err) {
                    console.error("Error adding friend:", err);
                    return res.status(500).send("Error adding friend");
                  }

                  const q4 = 'SELECT DISTINCT friend_name, friend_table_name FROM friendsLinked WHERE userid = ? AND friend_name IS NOT NULL';
                  connection.query(q4, [userEntered_ID], (err, resu) => {
                    if (err) {
                      console.error("Error fetching friends:", err);
                      return res.status(500).send("Error fetching friends");
                    }
                    res.render("./Friends/home.ejs", {
                      title_friends,
                      path_friends,
                      message: "Friend added successfully! Happy sharing and enjoy Chippin",
                      resu: resu || []
                    });
                  });
                });
              });
            });
          });
        });
      }
    });
  });


//Delete Friend

app.delete("/Delete/:user_name",(req,res)=>{
    let {user_name}=req.params;
    let q='delete from friendsLinked where userid = (?) and friend_table_name = (?)';
    connection.query(q,[userEntered_ID,user_name],(err)=>{
        if(err){
            console.error("Error checking friend:", err);
            return res.status(500).send("Error checking friend");
        }
        let q='select user_id from user where username = (?)';
        connection.query(q,[user_name],(err,resp)=>{
            if(err){
                return err;
            }
            console.log(resp);
            let q1='delete from friendsLinked where userid = (?) and friend_table_name = (?)';
            connection.query(q1,[resp[0].user_id,userEntered_uname],(err)=>{
                if(err){
                    return err;
                }
                res.redirect('/Friends');
            })
        })
    })
})

//Show Expenses

let borrowerName;
let currency;
app.route('/Show/:query')
.get((req, res) => {
    path_friends = "./Friends-Styles/show-page.css";
    let q = 'select name from user where username = ?';
    connection.query(q, [req.params.query], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error while fetching borrower name.");
        }
        if (result.length === 0) {
            return res.status(404).send("User not found.");
        }
        borrowerName = result[0].name;
        
        let transactionQuery = `SELECT amount, description, dateadded, currency, settlement_option, lender, borrower 
                              FROM ${req.params.query} 
                              WHERE (lender = ? AND borrower = ?) OR (lender = ? AND borrower = ?) 
                              ORDER BY dateadded DESC`;
        
        Settlementconnection.query(transactionQuery, [userEntered_uname, req.params.query, req.params.query, userEntered_uname], (err, transactions) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error fetching transactions");
            }
            let q5 = `SELECT SUM(amount) as t_sum 
                     FROM ${req.params.query} 
                     WHERE borrower = ? AND lender = ?`;
            let q6 = `SELECT SUM(amount) as t_sum1 
                     FROM ${req.params.query} 
                     WHERE borrower = ? AND lender = ?`;

            Settlementconnection.query(q5, [userEntered_uname, req.params.query], (err, response) => {
                if(err) {
                    return res.status(500).send(err);
                }
                
                Settlementconnection.query(q6, [req.params.query, userEntered_uname], (err, response1) => {
                    if(err) {
                        return res.status(500).send(err);
                    }

                    res.render('./ShowPage/home-page.ejs', {
                        title_friends: 'Chippin - Show',
                        path_friends,
                        query: req.params.query,
                        fname: borrowerName,
                        result: transactions,
                        response,
                        response1,
                        currency: "1"
                    });
                });
            });
        });
    });
})

.post((req, res) => {
    let { query } = req.params;
    let { amount, description, settlementDetail, btnradio } = req.body;
    amount = parseFloat(amount);
    if(settlementDetail === '0' || settlementDetail === '1') {
        amount = amount / 2;
    }
    
    let date = new Date().toLocaleDateString();
    
    if(settlementDetail === '0' || settlementDetail === '2') {
        let q = `insert into ${query} (lender, borrower, amount, description, dateadded, currency, settlement_option) 
                values (?, ?, ?, ?, ?, ?, ?)`;
        let q3 = `insert into ${userEntered_uname} (lender, borrower, amount, description, dateadded, currency, settlement_option) 
                 values (?, ?, ?, ?, ?, ?, ?)`;
        Settlementconnection.query(q, [userEntered_uname, query, amount, description, date, btnradio, settlementDetail], (err) => {
            if(err) {
                return res.status(500).send(err);
            }
            Settlementconnection.query(q3, [userEntered_uname, query, amount, description, date, btnradio, settlementDetail], (err) => {
                if(err) {
                    return res.status(500).send(err);
                }
                res.redirect(`/Show/${query}`);
            });
        });
    }
    
    if(settlementDetail === '1' || settlementDetail === '3') {
        let q = `insert into ${query} (lender, borrower, amount, description, dateadded, currency, settlement_option) 
                values (?, ?, ?, ?, ?, ?, ?)`;
        let q3 = `insert into ${userEntered_uname} (lender, borrower, amount, description, dateadded, currency, settlement_option) 
                 values (?, ?, ?, ?, ?, ?, ?)`;
        
        Settlementconnection.query(q, [query, userEntered_uname, amount, description, date, btnradio, settlementDetail], (err) => {
            if(err) {
                return res.status(500).send(err);
            }
            
            Settlementconnection.query(q3, [query, userEntered_uname, amount, description, date, btnradio, settlementDetail], (err) => {
                if(err) {
                    return res.status(500).send(err);
                }
                res.redirect(`/Show/${query}`);
            });
        });
    }
});
app.delete("/Show/:query", (req, res) => {
    let { query } = req.params;
    let q_1 = `delete from ${query} where (lender = ? and borrower = ?) or (lender = ? and borrower = ?)`;
    let q_2 = `delete from ${userEntered_uname} where (lender = ? and borrower = ?) or (lender = ? and borrower = ?)`;
    Settlementconnection.query(q_1, [userEntered_uname, query, query, userEntered_uname], (err, result) => {
        if(err) {
            return res.send(err);
        }
        Settlementconnection.query(q_2, [userEntered_uname, query, query, userEntered_uname], (err, result) => {
            if(err) {
                return res.send(err);
            }
            res.redirect(`/Show/${query}`);
        });
    });
});

app.route("/Expenses")
.get((req,res)=>{
    let q=`CREATE TABLE IF NOT EXISTS ${userEntered_uname} (id int primary key auto_increment,amount float,description varchar(200),currency varchar(5),spend_date date)`;
    expenses.query(q,(err)=>{
        if(err){
            res.send(err);
        }
    });
    let q1=`select id,spend_date,amount,description,currency from ${userEntered_uname} order by spend_date DESC;`
    expenses.query(q1,(err,result)=>{
        if(err){
            res.send(err);
        }
        let q3=`select Sum(amount) as t_sum from ${userEntered_uname}`;
        let date=new Date();
        let month=date.getMonth()+1;
        expenses.query(q3,(err,resultSum)=>{
            if(err){
                return res.send(err);
            }
            let q4=`select Sum(amount) as t_sumM from ${userEntered_uname} where MONTH(spend_date) = ?`;
            expenses.query(q4,[month],(err,result_m)=>{
                if(err){
                    return res.send(err);
                }
                res.render("./Expenses/expenses-home.ejs",{result,resultSum,result_m});
            })  
        })
       
    })
    
})
.post((req,res)=>{
    let {btnradio,amount,date,description}=req.body;
    let q2 = `insert into ${userEntered_uname} (amount,description,currency,spend_date) values (? , ? , ? ,?)`;
    expenses.query(q2,[amount,description,btnradio,date],(err,result)=>{
        if(err){
            res.send(err);
        }
        res.redirect("/Expenses");
    })
})

//Delete Expense;
app.delete("/Expenses/delete/:query",(req,res)=>{
    let {query}=req.params;
    console.log(query);
    let q=`delete from ${userEntered_uname} where id = ?`;
    expenses.query(q,[query],(err,result)=>{
        if(err){
            return res.send(err);
        }
        res.redirect('/Expenses');
    });
});