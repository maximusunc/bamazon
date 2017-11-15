var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
	start();
});

function start() {
	connection.query("SELECT * FROM products", function(error, results, fields) {
		if (error) throw error;
		console.log("-------|----------|---------");
		console.log("product_id | product_name | price");
		console.log("-------|----------|---------");
		for (var i = 0; i < results.length; i++) {
			console.log(results[i].item_id + " | " + results[i].product_name + " | " + results[i].price);
			console.log("-------|----------|---------");
		};
		inquirer.prompt([
		{
			type: "input",
			name: "id",
			message: "What is the product id of the item you would like to purchase?"
		}]).then(function(answer) {
			var id = answer.id;
			inquirer.prompt([
			{
				type: "input",
				name: "quantity",
				message: "How much would you like to buy?"
			}]).then(function(answer) {
				var quantity = answer.quantity;
				buy(id, quantity);
			});
		});
	});
	
};

function buy(id, quantity) {
	connection.query("SELECT stock_quantity FROM products WHERE item_id=?", id, function(error, results, fields) {
		if (error) throw error;
		console.log(results[0].stock_quantity);
		var newQuantity = results[0].stock_quantity - quantity;
		if (results[0].stock_quantity >= quantity) {
			connection.query("UPDATE products SET ? WHERE ?",
				[{
					stock_quantity: newQuantity
				}, {
					item_id: id
				}], function(error) {
					if (error) throw error;
					console.log("Order placed!");
					order(id, quantity);
				});
		} else {
			console.log("Not enough!");
			nextOrder();
		};
	});
}; 

function order(id, quantity) {
	connection.query("SELECT price FROM products WHERE item_id=?", id, function(error, results, fields) {
		if (error) throw error;
		console.log("Your price is: " + (results[0].price * quantity));
		nextOrder();
	});
};

function nextOrder() {
	inquirer.prompt([
	{
		type: "confirm",
		name: "confirm",
		message: "Would you like to make another purchase?"
	}]).then(function(answer) {
		if (answer.confirm) {
			start();
		} else {
			quit();
		};
	});
};

function quit() {
	console.log("Goodbye!");
	connection.end();
};