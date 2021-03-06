// require node packages
var mysql = require('mysql');
var prompt = require('prompt');
var inquirer = require('inquirer');
var Table = require('cli-table');

// database connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "password", //Your password
    database: "BamazonDB"
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
})



// query to display all of the items available for sale. Include the ids, names, and prices 

// connection.query('SELECT * FROM Products', function(err, res){
// 	if (err) throw err;
// 	for (var i = 0; i < res.length; i++) {

// 		console.log("");
// 		console.log("Item ID: "+res[i].ItemID);
// 		console.log("Product Name: "+res[i].ProductName);
// 		console.log("Price: "+res[i].Price);
// 		console.log("==============================");
// 	}

// });

var buy = function() {
    connection.query('SELECT * FROM Products', function(err, res, fields) {
    	// console.log(res);


// instantiate 
var table = new Table({
    head:["ItemID", "Product Name", "Department Name", "Price", "Quantity"]
  // , colWidths: [100, 200]
});
 
// table is an Array, so you can `push`, `unshift`, `splice` and friends 

for (var i= 0; i<res.length;i++){

table.push([res[i].ItemID, res[i].ProductName, res[i].DepartmentName, res[i].Price, res[i].StockQuantity]);

}
 
console.log(table.toString());

    	// The app should then prompt users with two messages.
		// The first should ask them the ID of the product they would like to buy.
        inquirer.prompt({
            name: "choice",
            type: "list",
            choices: function(value) {
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                    choiceArray.push(res[i].ProductName);
                }
                return choiceArray;
                console.log(choiceArray);
            },
            message: "What item would you like to purchase?"
		}).then(function(answer) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].ProductName == answer.choice) {
                    var chosenItem = res[i];
                    // The second message should ask how many units of the product they would like to buy.
                    inquirer.prompt({
                        name: "quantity",
                        type: "input",
                        message: "How many would you like to purchase?"
                    }).then(function(answer) {

                    	// Once the customer has placed the order,  check if your store has enough of the product to meet the customer's request.
                        if (chosenItem.StockQuantity < parseInt(answer.quantity)) {

                        	// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
                        	console.log('Sorry, Insufficient Quantity. Cannot Fulfill Transaction');


                           
                        } else {
                        	var qty = parseInt(answer.quantity);

                        	// However, if your store does have enough of the product, you should fulfill the customer's order.
							// This means updating the SQL database to reflect the remaining quantity.
                        	connection.query("UPDATE Products SET ? WHERE ?", [{
                                StockQuantity: (chosenItem.StockQuantity-qty)
                            }, {
                                ProductName: chosenItem.ProductName
                            }], function(err, res) {
                                console.log("Item purchased successfully!");
							});

                        	// Once the update goes through, show the customer the total cost of their purchase.
                            console.log("The Total Price for "+parseInt(answer.quantity)+" "+chosenItem.ProductName+ "(s) is "+chosenItem.Price*parseInt(answer.quantity));

                           
                        }
 

                    })
                }
            }
        })
    })
}

buy();




