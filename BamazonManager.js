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
    runManager();
})



// List a set of menu options:
// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product

var runManager = function() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }).then(function(answer) {
        switch(answer.action) {
            case 'View Products for Sale':
                productList();
            break;
            
            case 'View Low Inventory':
                lowInventory();
            break;
            
            case 'Add to Inventory':
                addInventory();
            break;
            
            case 'Add New Product':
                addNewProduct();
            break;
        }
    })
};
// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.

var productList = function() {
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
	});
};    

// If a manager selects View Low Inventory, then it should list all items with a inventory count lower than five.


var lowInventory = function() {
    connection.query('SELECT * FROM Products Where StockQuantity < 5', function(err, res, fields) {
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
	});
};    

// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.

var addInventory = function() {
    connection.query('SELECT * FROM Products', function(err, res, fields) {
    	// console.log(res);


// instantiate 
var table = new Table({
    head:["ItemID", "Product Name", "Quantity"]
  // , colWidths: [100, 200]
});
 
// table is an Array, so you can `push`, `unshift`, `splice` and friends 

for (var i= 0; i<res.length;i++){

table.push([res[i].ItemID, res[i].ProductName, res[i].StockQuantity]);

}
 
console.log(table.toString());

    	// The app should then prompt users with two messages.
		// The first should ask them the ID of the product they would like to add inventory for.
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
            message: "What item would you like to add to increase quantity for?"
		}).then(function(answer) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].ProductName == answer.choice) {
                    var chosenItem = res[i];
                    // The second message should ask how many units of the product they would like to add.
                    inquirer.prompt({
                        name: "quantity",
                        type: "input",
                        message: "How many would you like to add?"
                    }).then(function(answer) {

				
                        	var qty = parseInt(answer.quantity);
							// This means updating the SQL database to reflect the new quantity.
                        	connection.query("UPDATE Products SET ? WHERE ?", [{
                                StockQuantity: (chosenItem.StockQuantity+qty)
                            }, {
                                ProductName: chosenItem.ProductName
                            }], function(err, res) {
                                console.log("Item quantity updated successfully!");
							});
  
                    })
                }
            }
        })
    })
}



// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

var addNewProduct = function() {
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "What is the new product you want to add?"
    }, {
        name: "department",
        type: "input",
        message: "What department would you like to place this product in?"
    }, {
        name: "price",
        type: "input",
        message: "What is this item's price?",
        validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
         }   
     }, {  
        name: "quantity",
        type: "input",
        message: "What is this item's quantity?",
        validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    }]).then(function(answer) {
        connection.query("INSERT INTO Products SET ?", {
            ProductName: answer.item,
            DepartmentName: answer.department,
            Price: answer.price,
            StockQuantity: answer.quantity
        }, function(err, res) {
            console.log("Your new product was added successfully!");
            runManager();
        });
    });
}




