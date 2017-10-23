var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table")

var connection = mysql.createConnection({
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
 
 customerInteraction()
  

});


function customerInteraction()
{
  console.log("")		
  
  console.log("***********PRODUCTS FOR SALE*******************\n");
  connection.query("SELECT * FROM topProducts", function(err, res)
   {
		if (err) throw err;
		
		var table = new Table
		({
		    head: ['Item-ID', 'Products','Price']
		  , colWidths: [10, 20,20]
		});
		// Log all results of the SELECT statement
		for (var i = 0; i <res.length; i++) 
		{
		
		table.push
		(
		    [res[i].item_id, res[i].product_name,res[i].price]
		  
		);
		
		}
		
		console.log(table.toString());

				
		inquirer
		.prompt
		([
						
			{
			  name: "productid",
			  type: "input",
			  message: "Enter the ID of product you want to buy?"
			},
			
			{
			  name: "quantity",
			  type: "input",
			  message: "Enter the quantity you want to buy  :"
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
				if(data[0].stock_quantity>quantity)
				{
					console.log("------------------------------------------")
					console.log("Your total is $ ",quantity*data[0].price)
					console.log("------------------------------------------")
					var query = connection.query
					(
					    "UPDATE topProducts SET ? WHERE ?",
					    [
					      {
					        stock_quantity: data[0].stock_quantity-quantity
					      },
					      {
					        item_id: item
					      }
					    ],
					    function(err, res) 
					    {
					      console.log("------------------------------------------")
						  console.log("Your order has been processed " )
						  console.log("------------------------------------------")
					      //console.log("stock updated");
					      continueShopping()
					      
					    }
  					);//update query closing
				}//if closing
				else
				{
					console.log("------------------------------------------")
					console.log("Sorry out of stock")
					console.log("------------------------------------------")

					continueShopping()

				}//else closing
			});//connection.query closing
			
		});//.then closing
	
 	});	
}//customerInteraction closing

////////////////// Function to continue or exit ///////////////////////////////////
function continueShopping()
{
	inquirer
		.prompt
		([
						
						{
		      type: "confirm",
		      message: "Do you want to continue shopping:",
		      name: "confirm",
		      default: true
		    }
		 ]).then(function(answer)
		 {
		 	if(answer.confirm)
		 	{
		 		customerInteraction()
		 	}
		 	else
		 	{
		 		console.log("------------------------------------------")
		 		console.log("Thank you for shopping with Bamazon")
		 		console.log("------------------------------------------")
		 		process.exit()
		 		//return;
		 	}
		 });   

}
