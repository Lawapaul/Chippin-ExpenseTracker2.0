let btn=document.querySelector(".addFriend");
let addiv=document.querySelector('.friendBox');
btn.addEventListener('click',(res)=>{
    res.preventDefault();
    addiv.style.display='block';
    btn.style.display="none";
})
let close=document.querySelector('.close');
close.addEventListener('click',(res)=>{
    res.preventDefault();
    addiv.style.display='none';
    btn.style.display="block";
})