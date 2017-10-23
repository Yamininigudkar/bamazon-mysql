var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table")

var connection = mysql.createConnection
({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "northwestern12@",
  database: "product_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
 
 viewInventoryData()
  
});


function viewInventoryData() 
{
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        	" View Products for Sale",
       	    "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
      ]
    })
    .then(function(answer)
     {
      switch (answer.action)
       {
        case " View Products for Sale":
          saleData();
          break;

        case  "View Low Inventory":
          lowInventoryData();
          break;

        case  "Add to Inventory":
          addInventory();
          break;

        case "Add New Product":
          addNewProduct();
          break;

       }
    });
}

function saleData()
{
	console.log("**************** SALE DATA ************************")
	connection.query("SELECT * FROM topProducts", function(err, res)
   {
		if (err) throw err;
		
		var table = new Table
		({
		    head: ['Item-ID', 'Products','Department','Price','Stock']
		  , colWidths: [10, 20,20,15,15]
		});
		// Log all results of the SELECT statement
		for (var i = 0; i <res.length; i++) 
		{
		
		table.push
		(
		    [res[i].item_id, res[i].product_name,res[i].department_name,res[i].price,res[i].stock_quantity]
		  
		);
		
		}//for loop closing
		console.log(table.toString());//logging table
	    continueUpdating()
	});	
}
//////////////////////////Function to view low inventory data////////////////////////////////////////////////

function lowInventoryData()
{
	
  var query = "SELECT * FROM topProducts GROUP BY stock_quantity HAVING stock_quantity <100 ";
  connection.query(query, function(err, res)
  //connection.query("SELECT * FROM topProducts", function(err, res)
   {
		if (err) throw err;
		//console.log(res)
		
		var table = new Table
		({
		    head: ['Item-ID', 'Products','Department','Price','Stock']
		  , colWidths: [10, 20,20,15,15]
		});
		// Log all results of the SELECT statement
		for (var i = 0; i <res.length; i++) 
		{
		//console.log("Item-ID " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Price($): " + res[i].price + " || Stock($): " + res[i].stock_quantity)
		table.push
		(
		    [res[i].item_id, res[i].product_name,res[i].department_name,res[i].price,res[i].stock_quantity]
		  
		);
		
		}
		
		console.log(table.toString());
		continueUpdating()

				
		
   	});	

}

///////////////////////////Function to add a new product ///////////////////////////////////////////////

function addNewProduct()
{
	inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "Enter product name --"
      },
      {
        name: "department",
        type: "input",
        message: "Enter the department for the new product --"
      },
      {
        name: "price",
        type: "input",
        message: "Enter the price of product --",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "stock",
        type: "input",
        message: "Enter the stock quantity --",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO topProducts SET ?",
        {
          product_name: answer.item,
          department_name: answer.department,
          price: answer.price,
          stock_quantity: answer.stock
        },
        function(err) {
          if (err) throw err;
          console.log("Your product was created successfully!");
          // re-prompt the user for if they want to bid or post
          continueUpdating()
        }
      );
    });
}
/////////// Function to add stock to the Inventory///////////////////////
function addInventory()
{
	inquirer
		.prompt
		([
						
			{
			  name: "productid",
			  type: "input",
			  message: "Enter the ID of the product you want to add stock to ?"
			},
			{
		      type: "confirm",
		      message: "Are you sure:",
		      name: "confirm",
		      default: true
		    },
			{
			  name: "quantity",
			  type: "input",
			  message: "Enter the quantity you want to add  :"
			}
		])
		.then(function(answer)
		 {
		 	//Check the stock of the product that was chosen to see avaibility
		 	//If stock is available process order and update the stock quantity
		 	//else log a msg to customer that its out of stock
		 	var item = answer.productid;
			var quantity = answer.quantity;

		// Query db to confirm that the given item ID exists in the desired quantity
		var queryStr = 'SELECT * FROM topProducts WHERE ?';
		connection.query(queryStr, {item_id: item}, function(err, data) 
			{
				if (err) throw err;
				// if(data[0].stock_quantity>quantity)
				// {
					//console.log("Your order has been processed " )
					//console.log("Your total is $ ",quantity*data[0].price)
					var query = connection.query
					(
					    "UPDATE topProducts SET ? WHERE ?",
					    [
					      {
					        stock_quantity: data[0].stock_quantity+parseInt(quantity)
					      },
					      {
					        item_id: item
					      }
					    ],
					    function(err, res) 
					    {
					      console.log("stock updated");
					      continueUpdating()
					    }
  					);//update query closing
				
			});//connection.query closing
			
		});//.then closing
	


}
function continueUpdating()
{
	inquirer
		.prompt
		([
						
						{
		      type: "confirm",
		      message: "Do you want to continue :",
		      name: "confirm",
		      default: true
		    }
		 ]).then(function(answer)
		 {
		 	if(answer.confirm)
		 	{
		 		viewInventoryData()
		 	}
		 	else
		 	{
		 		console.log("------------------------------------------")
		 		console.log("Thank you ")
		 		console.log("------------------------------------------")
		 		process.exit()
		 		//return;
		 	}
		 });   

}
