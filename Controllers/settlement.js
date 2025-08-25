const User = require('../models/User.js');
const settlementMode = require('../models/TransactionSchema.js');

module.exports.settlementGet = async(req,res)=>{
    const result = await User.findById(res.locals.currentUser._id).populate('friends');
    // Sort friends by spend_date descending if spend_date exists, otherwise leave unsorted
    let sortedFriends = result.friends;
    if (sortedFriends.length > 0 && sortedFriends[0].spend_date) {
        sortedFriends = sortedFriends.sort((a, b) => new Date(b.spend_date) - new Date(a.spend_date));
    }
    res.render("Friends/home",{
        title: "Friends",
        style_path: "/Friends-Styles/home.css",
        message: "Harshit",
        result: sortedFriends
    });
};

module.exports.settlementPost = async(req,res)=>{
    let {username} = req.body;
    userDetails = await User.findOne({username: username});
    if(userDetails==null){
        req.flash("error","User Does not Exist. Ask your Friaend to Join Chippin");
        return res.redirect("/settlement");
    }
    let alreadyExists = res.locals.currentUser.friends.some((ele)=>{
        return ele.equals(userDetails._id);
    })
    if(alreadyExists){
         req.flash("error","Friend Already Exists");
         return res.redirect("/settlement");
    }
    const currentUser = await User.findById(res.locals.currentUser._id);
    currentUser.friends.push(userDetails._id);
    currentUser.save();
    //Adding Friend for another user too
    userDetails.friends.push(currentUser._id);
    userDetails.save();
    req.flash("success",'Friend Added Successfully');
    return res.redirect("/settlement");
}

module.exports.individual = async(req,res)=>{
    let {id} = req.params;
    const friend = await User.findById(id);
    // Populate settlements for the current user
    const transaction = await User.findById(res.locals.currentUser._id).populate('settlement');
    let user_total = 0;
    let friend_total = 0;
    for (let s of transaction.settlement) {
        if (
            (s.payer.equals(res.locals.currentUser._id) && s.participant.equals(friend._id)) ||
            (s.payer.equals(friend._id) && s.participant.equals(res.locals.currentUser._id))
        ) {
            if (s.details && s.details.includes('split Equally')) {
                if (s.payer.equals(res.locals.currentUser._id)) {
                    // Paid by current user and split equally
                    user_total += 0;
                    friend_total += s.amount;
                } else {
                    // Paid by friend and split equally
                    user_total += s.amount;
                    friend_total += 0;
                }
            }
            else if (s.details && s.details.includes('owes you')) {
                // Friend owes you
                user_total += 0;
                friend_total += s.amount;
            }
            else if (s.details && s.details.includes('You owe')) {
                // You owe friend
                user_total += s.amount;
                friend_total += 0;
            }
        }
    }
    res.render("ShowPage/home-page", {
        title: "Show Page",
        style_path: "/Expenses-Style/style.css",
        id,
        result: transaction.settlement.filter(s =>
            (s.payer.equals(res.locals.currentUser._id) && s.participant.equals(friend._id)) ||
            (s.payer.equals(friend._id) && s.participant.equals(res.locals.currentUser._id))
        ),
        friend,
        currentUser: res.locals.currentUser,
        user: user_total,
        front: friend_total,
        total_expenses: user_total - friend_total
    });
}
module.exports.individualPost = async(req,res)=>{
    let {id}=req.params;
    const userFriend = await User.findById(id);
    let { btnradio,amount,date,description,details}=req.body;
    let data = {};
    let date_obj = new Date(req.body.date);  // convert to Date object
    const formatted = date_obj.toISOString().split('T')[0];
    data.date = formatted;
    data.description=description;
    data.currency = btnradio;
    amount = Number(amount);
    if(details==="you/2"){
        data.payer = res.locals.currentUser._id;
        data.amount = amount/2;
        data.participant = id;
        data.details = `Paid by ${res.locals.currentUser.name} and split Equally`;
    }
    if(details==="friend/2"){
        data.payer = userFriend._id;
        data.amount = amount/2;
        data.participant = res.locals.currentUser._id;
        data.details = `Paid by ${userFriend.name} and split Equally`;
    }
    if(details==="you"){
        data.payer = res.locals.currentUser._id;
        data.amount = amount;
        data.participant = id;
        data.details = `${userFriend.name} owes you`;
    }
    if(details==="friend"){
        data.payer = userFriend._id;
        data.amount = amount;
        data.participant = res.locals.currentUser._id;
        data.details = `You owe ${userFriend.name}`;
    }
    const insertData = await settlementMode.create(data);
    // Add transaction to both users' settlement arrays
    const current=await User.findById(res.locals.currentUser._id);
    if (!current.settlement.includes(insertData._id)) {
        current.settlement.push(insertData._id);
        await current.save();
    }
    if (!userFriend.settlement.includes(insertData._id)) {
        userFriend.settlement.push(insertData._id);
        await userFriend.save();
    }
    return res.redirect(`/settlement/${id}`)
}

module.exports.individualDelete = async(req,res)=>{
    let {id} = req.params;
    const userDelete = await User.findById(id);
    //delete from currentUser
    await User.findByIdAndUpdate(res.locals.currentUser._id,{$pull: {friends: {$in: [userDelete._id]}}})
    //delete from another side too
    await User.findByIdAndUpdate(id,{$pull: {friends: {$in: [res.locals.currentUser._id]}}})
    return res.redirect("/settlement");
}
module.exports.settleUp = async (req, res) => {
    const { id } = req.params;
    const currentUserId = res.locals.currentUser._id;
    const friendId = id;

    const transactions = await settlementMode.find({
        $or: [
            { payer: currentUserId, participant: friendId },
            { payer: friendId, participant: currentUserId }
        ]
    });
    const transactionIds = transactions.map(t => t._id);
    // Remove these transactions from both users' settlement arrays
    await User.findByIdAndUpdate(currentUserId, { $pull: { settlement: { $in: transactionIds } } });
    await User.findByIdAndUpdate(friendId, { $pull: { settlement: { $in: transactionIds } } });
    // Delete the transactions themselves
    await settlementMode.deleteMany({ _id: { $in: transactionIds } });
    req.flash('success', 'All transactions with this friend have been settled!');
    res.redirect(`/settlement/${friendId}`);
}