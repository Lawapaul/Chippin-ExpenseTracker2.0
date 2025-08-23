require('dotenv').config()
const express=require('express');
const path=require('path'); 
const app = express();
const methodOverride = require('method-override')
const engine=require('ejs-mate');
const expressError=require("./utils/expressError.js");
const passport=require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/User.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoose = require('mongoose');

const store = MongoStore.create({
    mongoUrl: process.env.mongoATLAS,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
  })

  store.on("error",()=>{
    console.log("error");
  })
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
}

app.set('view engine','ejs');
app.engine('ejs', engine);
app.use(methodOverride('_method'))
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended: true}))
app.use(express.json());

//Passport and Session Middlewares


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

const dburl = process.env.mongoATLAS;
main().catch(err => console.log(err));
main().then(()=>{
    console.log("DB Connected");
})
async function main() {
  await mongoose.connect(dburl);
}


const authRouter = require('./routes/auth.js');
const forgotRouter = require('./routes/forgot.js');
const homeRouter = require('./routes/home.js');
const profileRouter = require('./routes/profile.js')
const expenseRouter = require("./routes/Expenses.js");
const settlementRouter = require("./routes/Settlement.js");

app.use('/auth',authRouter);
app.use('/forgot',forgotRouter);
app.use("/home",homeRouter);
app.use('/profile',profileRouter)
app.use("/expenses",expenseRouter);
app.use("/settlement",settlementRouter);

// Add root route handler
app.get('/', (req, res) => {
    res.redirect('/home');
});

// Handle all other routes - redirect to home instead of showing 404
app.use('*',(req,res,next)=>{
    res.redirect('/home');
});

app.use((err,req,res,next)=>{
    let {status=500,message="Something Went Wrong"} = err;
    res.status(status).render("./error.ejs",{message})
    
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


