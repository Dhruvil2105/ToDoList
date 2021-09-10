

const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app =express();

app.set("view engine","ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin_dj:admin_dj@cluster0.gvqfq.mongodb.net/TodoListDB",{useNewUrlParser:true});

const itemsSchema = {
  name :String
};

const Item = mongoose.model("Item",itemsSchema);


const item1 = new Item({
  name : "Tea"
});

const item2 = new Item({
  name : "Walk"
});

const item3 = new Item({
  name : "Shopping"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name :String,
  listitem : [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("insert items done.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle:"Today" , newitems:foundItems});
    }
  });
  
});

app.get("/:requestedName",function(req,res){
  const requestedName = _.capitalize(req.params.requestedName);

  List.findOne({name :requestedName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name :requestedName,
          listitem : defaultItems
        });
        list.save();
        res.redirect("/" + requestedName);
      }
      else{
        res.render("list",{listTitle:foundlist.name , newitems:foundlist.listitem});
      }
    }
  });
});

app.post("/",function(req,res){
const itemName = req.body.textbox;
const listName = req.body.list;

 const item = new Item({
   name:itemName
 });

 if(listName === "Today"){
  item.save();
  res.redirect("/");
 }else{
   List.findOne({name:listName},function(err,foundList){
    if(!err){
      foundList.listitem.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }
   });
 }
  
});

app.post("/delete",function(req,res){
  const checkedItemId =req.body.checkbox;
  const listNameTitle = req.body.listNameTitle;

  if(listNameTitle === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("item deleted.");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name :listNameTitle},{$pull: {listitem: {_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listNameTitle);
      }
    });
  }
 
});


app.listen(process.env.PORT||"3000",function(){
  console.log("working no todolist");
});